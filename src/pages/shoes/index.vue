<template>
  <view class="shoe-page">
    <view class="shoe-stage" :style="stageStyle">
      <view class="shoe-canvas" :style="canvasStyle">
        <image :key="shoeFrames[activeFrame]" class="shoe-artwork" :class="{ 'shoe-artwork--switching': isSwitching }" :src="shoeFrames[activeFrame]" mode="widthFix" draggable="false" />
        <view class="change-hitbox" role="button" aria-label="换一个新同事" @tap="nextShoe" />
        <view class="close-hitbox" role="button" aria-label="返回首页" @tap="returnHome" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

type ResultKey = 'involution' | 'showoff' | 'steady' | 'love-feet'

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
  if (type && type in firstFrameByResult) activeFrame.value = firstFrameByResult[type]
})

function nextShoe() {
  isSwitching.value = true
  activeFrame.value = (activeFrame.value + 1) % shoeFrames.length
  setTimeout(() => { isSwitching.value = false }, 260)
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

.shoe-artwork--switching { animation: shoe-switch .26s cubic-bezier(.2, .8, .3, 1); }

.change-hitbox,
.close-hitbox {
  position: absolute;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}

/* Figma 节点 1:371，视觉保持原样，仅使用透明热区接收点击。 */
.change-hitbox { top: 742px; left: 216px; width: 149px; height: 54px; }
.close-hitbox { top: 57px; left: 14px; width: 30px; height: 30px; }

@keyframes shoe-switch {
  from { opacity: .5; transform: scale(.965) rotate(-.8deg); }
  to { opacity: 1; transform: scale(1) rotate(0); }
}

@media (prefers-reduced-motion: reduce) {
  .shoe-artwork--switching { animation: none; }
}
</style>
