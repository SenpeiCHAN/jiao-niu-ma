<template>
  <view class="shoe-page">
    <view class="shoe-stage" :style="stageStyle">
      <view class="shoe-canvas" :style="canvasStyle">
        <image :key="shoeFrames[activeFrame]" class="shoe-artwork" :src="shoeFrames[activeFrame]" mode="widthFix" draggable="false" />

        <!-- Figma 节点 1:450：只在原 299×385 白色圆角框内承载动态 AI 图片。 -->
        <view class="ai-image-slot" :class="{ 'ai-image-slot--switching': isSwitching }">
          <image
            v-if="generatedImageUrl"
            class="generated-shoe"
            :src="generatedImageUrl"
            mode="aspectFit"
            draggable="false"
          />
          <view v-else-if="isGenerating" class="generation-state generation-state--loading">
            <view class="loading-shoe" aria-hidden="true">
              <view class="loading-shoe__upper" />
              <view class="loading-shoe__sole" />
            </view>
            <text class="generation-title">正在匹配你的新牛马</text>
            <view class="loading-dots" aria-hidden="true"><view /><view /><view /></view>
            <view class="generation-progress" aria-hidden="true"><view /></view>
          </view>
          <view v-else class="generation-state" @tap="requestNewShoe">
            <text class="generation-title">{{ generationMessage }}</text>
            <text class="generation-action">{{ canGenerate ? '轻触重试' : '等待 AI 素材配置' }}</text>
          </view>
        </view>

        <view class="collect-hitbox" role="button" aria-label="保存你的新同事" @tap="collectShoe" />
        <view class="change-hitbox" role="button" aria-label="换一个新同事" @tap="requestNewShoe" />
        <view class="close-hitbox" role="button" aria-label="返回首页" @tap="returnHome" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { generateStyledShoe, generatedShoeDataUrl } from '../../services/ai'
import { saveResultImage } from '../../services/result-export'
import { RESULT_TO_AI_STYLE } from '../../types/ai'
import type { AiShoeStyleKey, ExistingResultKey } from '../../types/ai'

type ResultKey = ExistingResultKey

const DESIGN_WIDTH = 402
const DESIGN_HEIGHT = 874

// Figma 节点 1:350 / 1:375 / 1:400 / 1:425 / 1:451 的整页导出。
const shoeFrames = [
  '/static/figma/shoes/shoe-1.png',
  '/static/figma/shoes/shoe-2.png',
  '/static/figma/shoes/shoe-3.png',
  '/static/figma/shoes/shoe-4.png',
  '/static/figma/shoes/shoe-5.png',
] as const

const activeFrame = ref(0)
const isSwitching = ref(false)
const isGenerating = ref(false)
const generatedImageUrl = ref('')
const generationError = ref('')
const resultKey = ref<ResultKey>('involution')
const styleKey = computed<AiShoeStyleKey>(() => RESULT_TO_AI_STYLE[resultKey.value])

const styleName: Record<AiShoeStyleKey, string> = {
  involution: '内卷线牛马',
  showoff: '显眼包牛马',
  slacker: '摸鱼型牛马',
  'love-feet': '爱你老脚型牛马',
}

function bundledReferenceUrl(filename: string) {
  // H5 发布后使用当前 GitHub Pages 站点上的 HTTPS 静态素材；小程序后续改用 CloudBase 存储 URL。
  // #ifdef H5
  if (typeof window !== 'undefined') {
    const rawBase = import.meta.env.BASE_URL || '/'
    const basePath = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
    return new URL(`${basePath}static/ai-references/${filename}`, window.location.origin).href
  }
  // #endif
  return ''
}

const sourceImageByStyle: Record<AiShoeStyleKey, string> = {
  involution: import.meta.env.VITE_AI_SOURCE_INVOLUTION_URL?.trim() || bundledReferenceUrl('involution.png'),
  showoff: import.meta.env.VITE_AI_SOURCE_SHOWOFF_URL?.trim() || bundledReferenceUrl('showoff.png'),
  slacker: import.meta.env.VITE_AI_SOURCE_SLACKER_URL?.trim() || bundledReferenceUrl('slacker.png'),
  'love-feet': import.meta.env.VITE_AI_SOURCE_LOVE_FEET_URL?.trim() || bundledReferenceUrl('love-feet.png'),
}

const canGenerate = computed(() => sourceImageByStyle[styleKey.value].startsWith('https://'))
const generationMessage = computed(() => {
  if (generationError.value) return generationError.value
  if (canGenerate.value) return '点击生成你的新牛马'
  return sourceImageByStyle[styleKey.value]
    ? '请在 HTTPS 演示站生成新牛马'
    : '新牛马原型图尚未配置'
})

// 鞋款档案的前景主卡与四种人格工牌使用同一套 Figma 主色。
const firstFrameByResult: Record<ResultKey, number> = {
  involution: 0, // 蓝
  showoff: 4, // 黄
  steady: 3, // 绿
  'love-feet': 2, // 粉
}
const windowInfo = uni.getWindowInfo()
const pageScale = Math.min(
  windowInfo.windowWidth / DESIGN_WIDTH,
  windowInfo.windowHeight / DESIGN_HEIGHT,
  1,
)
const stageStyle = { width: `${DESIGN_WIDTH * pageScale}px`, height: `${DESIGN_HEIGHT * pageScale}px` }
const canvasStyle = { transform: `scale(${pageScale})` }

onLoad((options) => {
  const type = options?.type as ResultKey | undefined
  if (type && type in firstFrameByResult) resultKey.value = type
  activeFrame.value = firstFrameByResult[resultKey.value]
  void requestNewShoe()
})

async function requestNewShoe() {
  if (isGenerating.value || !canGenerate.value) return
  isGenerating.value = true
  generationError.value = ''
  isSwitching.value = true
  try {
    const image = await generateStyledShoe({
      styleKey: styleKey.value,
      sourceImageUrl: sourceImageByStyle[styleKey.value],
    })
    generatedImageUrl.value = generatedShoeDataUrl(image)
  } catch (error) {
    generationError.value = error instanceof Error ? error.message : 'AI 生图失败，请稍后重试'
  } finally {
    isGenerating.value = false
    setTimeout(() => { isSwitching.value = false }, 360)
  }
}

async function collectShoe() {
  if (!generatedImageUrl.value) {
    uni.showToast({ title: isGenerating.value ? '新牛马还在路上' : '请先生成新牛马', icon: 'none' })
    return
  }
  try {
    await saveResultImage(generatedImageUrl.value, `脚牛马-${styleName[styleKey.value]}-新同事`)
    uni.showToast({ title: '已开始保存', icon: 'none' })
  } catch {
    uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' })
  }
}

function returnHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
page { background: #000; }

.shoe-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

.shoe-stage { position: relative; flex: none; }

.shoe-canvas {
  position: relative;
  width: 402px;
  height: 874px;
  overflow: hidden;
  transform-origin: left top;
}

.shoe-artwork {
  display: block;
  width: 402px;
  height: 874px;
}

.ai-image-slot {
  position: absolute;
  z-index: 2;
  left: 51px;
  top: 248px;
  width: 299px;
  height: 385px;
  overflow: hidden;
  border-radius: 15px;
  background: #fff;
  transform-origin: 50% 62%;
}

.ai-image-slot--switching { animation: shoe-switch .36s cubic-bezier(.2, .8, .3, 1); }

.generated-shoe {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 18px 12px;
}

.generation-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #5e5e5e;
  text-align: center;
}

.generation-state--loading { color: #188c5b; }
.generation-title { max-width: 220px; font-size: 14px; line-height: 1.5; font-weight: 600; }
.generation-action { margin-top: 8px; font-size: 11px; color: #8a8a8a; }

.loading-shoe { position: relative; width: 92px; height: 43px; margin-bottom: 20px; animation: loading-float 1.8s ease-in-out infinite; }
.loading-shoe__upper { position: absolute; left: 13px; top: 4px; width: 66px; height: 29px; border: 2px solid #188c5b; border-radius: 32px 20px 10px 14px; transform: skewX(-12deg); }
.loading-shoe__sole { position: absolute; left: 3px; bottom: 2px; width: 86px; height: 9px; border: 2px solid #188c5b; border-radius: 12px; background: #dbfbe9; }
.loading-dots { display: flex; gap: 5px; height: 16px; margin-top: 5px; }
.loading-dots > view { width: 5px; height: 5px; border-radius: 50%; background: #188c5b; animation: loading-dot 1.2s ease-in-out infinite; }
.loading-dots > view:nth-child(2) { animation-delay: .16s; }
.loading-dots > view:nth-child(3) { animation-delay: .32s; }
.generation-progress { width: 136px; height: 3px; overflow: hidden; margin-top: 12px; border-radius: 8px; background: #d9efe3; }
.generation-progress > view { display: block; width: 44%; height: 100%; border-radius: inherit; background: #188c5b; animation: loading-progress 1.6s ease-in-out infinite; }

.collect-hitbox,
.change-hitbox,
.close-hitbox {
  position: absolute;
  z-index: 3;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}

/* Figma 按钮视觉保持在原始整页图中，仅用同尺寸透明热区接收点击。 */
.collect-hitbox { top: 742px; left: 33px; width: 149px; height: 54px; }
.change-hitbox { top: 742px; left: 216px; width: 149px; height: 54px; }
.close-hitbox { top: 57px; left: 14px; width: 30px; height: 30px; }

@keyframes shoe-switch {
  from { opacity: .5; transform: scale(.965) rotate(-.8deg); }
  to { opacity: 1; transform: scale(1) rotate(0); }
}

@keyframes loading-float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-5px) rotate(1deg); }
}

@keyframes loading-dot {
  0%, 70%, 100% { opacity: .25; transform: translateY(0); }
  35% { opacity: 1; transform: translateY(-3px); }
}

@keyframes loading-progress {
  from { transform: translateX(-110%); }
  to { transform: translateX(340%); }
}

@media (prefers-reduced-motion: reduce) {
  .ai-image-slot--switching,
  .loading-shoe,
  .loading-dots > view,
  .generation-progress > view { animation: none; }
}
</style>
