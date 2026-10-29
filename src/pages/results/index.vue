<template>
  <view class="result-page">
    <view class="result-stage" :style="stageStyle">
      <view class="result-canvas" :style="canvasStyle">
        <!-- Figma 节点 1:671 的绿文件夹属于报告环境层；工牌动效只覆盖其前景，不会带动该文件夹。 -->
        <image class="result-artwork" :src="result.image" mode="widthFix" draggable="false" />

        <!-- 工牌由带描边的圆角卡体和顶部夹扣两个透明形状组成，常态自然轻摆。 -->
        <view class="badge-underlay-card" aria-hidden="true" />
        <view class="badge-underlay-clip" aria-hidden="true" />
        <view
          class="badge-swing-group"
          :class="{ 'badge-swing-group--tapped': isBadgeSwinging }"
          aria-hidden="true"
        >
          <view class="badge-crop badge-crop--clip">
            <image class="badge-swing-artwork badge-swing-artwork--clip" :src="result.image" mode="widthFix" draggable="false" />
          </view>
          <view class="badge-crop badge-crop--card">
            <image class="badge-swing-artwork badge-swing-artwork--card" :src="result.image" mode="widthFix" draggable="false" />
          </view>
        </view>

        <view class="download-hitbox" role="button" aria-label="下载工牌" @tap="downloadResult" />
        <view class="badge-hitbox" role="button" aria-label="晃动工牌" @tap="playBadgeSwing" />
        <view class="shoe-hitbox" role="button" aria-label="查看新同事资料" @tap="openShoePage" />
        <view class="close-hitbox" role="button" aria-label="返回首页" @tap="returnHome" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { saveResultImage } from '@/services/result-export'

type ResultKey = 'involution' | 'showoff' | 'steady' | 'love-feet'

const DESIGN_WIDTH = 402
const DESIGN_HEIGHT = 874

const results: Record<ResultKey, { image: string; fileName: string }> = {
  involution: { image: '/static/figma/results/result-involution.png', fileName: '脚牛马-内卷型牛马-员工工牌' },
  showoff: { image: '/static/figma/results/result-showoff.png', fileName: '脚牛马-显眼包牛马-员工工牌' },
  steady: { image: '/static/figma/results/result-steady.png', fileName: '脚牛马-安稳型牛马-员工工牌' },
  'love-feet': { image: '/static/figma/results/result-love-feet.png', fileName: '脚牛马-爱你老脚型牛马-员工工牌' },
}

const resultKey = ref<ResultKey>('involution')
const isExporting = ref(false)
const isBadgeSwinging = ref(false)
let badgeSwingTimer: ReturnType<typeof setTimeout> | undefined
const windowInfo = uni.getWindowInfo()
const pageScale = Math.min(
  windowInfo.windowWidth / DESIGN_WIDTH,
  windowInfo.windowHeight / DESIGN_HEIGHT,
  1,
)
const stageStyle = { width: `${DESIGN_WIDTH * pageScale}px`, height: `${DESIGN_HEIGHT * pageScale}px` }
const canvasStyle = { transform: `scale(${pageScale})` }
const result = computed(() => results[resultKey.value])

onLoad((options) => {
  const requestedKey = options?.type as ResultKey | undefined
  if (requestedKey && results[requestedKey]) resultKey.value = requestedKey
})

async function downloadResult() {
  if (isExporting.value) return
  isExporting.value = true
  try {
    await saveResultImage(result.value.image, result.value.fileName)
    uni.showToast({ title: '工牌已开始保存', icon: 'success' })
  } catch {
    uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
  } finally {
    isExporting.value = false
  }
}

async function playBadgeSwing() {
  if (badgeSwingTimer) clearTimeout(badgeSwingTimer)
  // 先移除状态再在下一帧加入，连续点击也会从第一帧重新播放强摆动。
  isBadgeSwinging.value = false
  await nextTick()
  isBadgeSwinging.value = true

  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'light' })
  // #endif

  badgeSwingTimer = setTimeout(() => { isBadgeSwinging.value = false }, 980)
}

function returnHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function openShoePage() {
  // 档案页首屏跟随当前工牌的 Figma 主色，而不是固定打开蓝色档案。
  uni.navigateTo({ url: `/pages/shoes/index?type=${resultKey.value}` })
}

onBeforeUnmount(() => {
  if (badgeSwingTimer) clearTimeout(badgeSwingTimer)
})
</script>

<style scoped>
page { background: #000; }

.result-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

.result-stage {
  position: relative;
  flex: none;
  animation: result-enter .34s cubic-bezier(.22, .82, .25, 1) both;
}

.result-canvas {
  position: relative;
  width: 402px;
  height: 874px;
  overflow: hidden;
  transform-origin: left top;
}

.result-artwork {
  position: relative;
  z-index: 0;
  display: block;
  width: 402px;
  height: 874px;
}

.badge-underlay-card,
.badge-underlay-clip {
  position: absolute;
  z-index: 1;
  background: #fdfaf5;
}

.badge-underlay-card {
  top: 174px;
  left: 14px;
  width: 187px;
  height: 270px;
  border-radius: 17px;
}

.badge-underlay-clip {
  top: 158px;
  left: 84px;
  width: 46px;
  height: 37px;
  border-radius: 7px;
}

.badge-swing-group {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 402px;
  height: 874px;
  transform-origin: 107px 161px;
  animation: badge-idle-sway 4.4s ease-in-out infinite alternate;
  pointer-events: none;
}

.badge-swing-group--tapped {
  animation: badge-tap-swing .96s cubic-bezier(.22, .78, .3, 1) both;
}

.badge-crop {
  position: absolute;
  overflow: hidden;
}

.badge-crop--clip { top: 161px; left: 87px; width: 40px; height: 31px; border-radius: 5px; }
.badge-crop--card { top: 177px; left: 17px; width: 181px; height: 264px; border-radius: 14px; }

.badge-swing-artwork {
  position: absolute;
  width: 402px;
  height: 874px;
  max-width: none;
}

.badge-swing-artwork--clip { top: -161px; left: -87px; }
.badge-swing-artwork--card { top: -177px; left: -17px; }

.download-hitbox,
.badge-hitbox,
.shoe-hitbox,
.close-hitbox {
  position: absolute;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}

/* Figma 节点 1:582：工牌左下角下载图标，17 × 17。扩展到 44 × 44 仅增加触摸命中区。 */
.download-hitbox { z-index: 4; top: 394px; left: 20px; width: 44px; height: 44px; }
.badge-hitbox { z-index: 3; top: 161px; left: 17px; width: 186px; height: 286px; }
.shoe-hitbox { top: 709px; left: 25px; width: 352px; height: 100px; }
.close-hitbox { top: 57px; left: 14px; width: 30px; height: 30px; }

@keyframes result-enter {
  from { opacity: 0; transform: translateY(10px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes badge-idle-sway {
  from { transform: rotate(-.7deg); }
  to { transform: rotate(.8deg); }
}

@keyframes badge-tap-swing {
  0% { transform: rotate(0); }
  18% { transform: rotate(5.2deg); }
  40% { transform: rotate(-4.3deg); }
  62% { transform: rotate(2.8deg); }
  81% { transform: rotate(-1.2deg); }
  100% { transform: rotate(0); }
}

@media (prefers-reduced-motion: reduce) {
  .result-stage,
  .badge-swing-group { animation: none; }
}
</style>
