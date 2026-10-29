<template>
  <view class="loading-page">
    <view class="loading-stage" :style="stageStyle">
      <view class="loading-canvas" :style="canvasStyle" :aria-label="label">
        <image
          v-for="(frame, index) in frames"
          v-show="activeFrame === index"
          :key="frame"
          class="loading-frame"
          :src="frame"
          mode="widthFix"
          draggable="false"
        />

        <!-- 仅覆盖原稿中的进度轨道：上方角色帧与这里的线性进度互不绑定。 -->
        <view class="linear-progress" aria-hidden="true">
          <view class="linear-progress__value" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  frames: readonly string[]
  label: string
  autoComplete?: boolean
}>()

const emit = defineEmits<{ complete: [] }>()

const DESIGN_WIDTH = 402
const DESIGN_HEIGHT = 874
const FRAME_DURATION = 460

const activeFrame = ref(0)
const windowInfo = uni.getWindowInfo()
const pageScale = Math.min(
  windowInfo.windowWidth / DESIGN_WIDTH,
  windowInfo.windowHeight / DESIGN_HEIGHT,
  1,
)
const stageStyle = {
  width: `${DESIGN_WIDTH * pageScale}px`,
  height: `${DESIGN_HEIGHT * pageScale}px`,
}
const canvasStyle = { transform: `scale(${pageScale})` }

let frameTimer: ReturnType<typeof setInterval> | undefined
let completionTimer: ReturnType<typeof setTimeout> | undefined

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  if (!prefersReducedMotion() && props.frames.length >= 2) {
    frameTimer = setInterval(() => {
      activeFrame.value = (activeFrame.value + 1) % props.frames.length
    }, FRAME_DURATION)
  }

  if (props.autoComplete) {
    completionTimer = setTimeout(() => emit('complete'), 3600)
  }
})

onUnmounted(() => {
  if (frameTimer) clearInterval(frameTimer)
  if (completionTimer) clearTimeout(completionTimer)
})
</script>

<style scoped>
page { background: #000; }

.loading-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

.loading-stage { position: relative; flex: none; }

.loading-canvas {
  position: relative;
  width: 402px;
  height: 874px;
  overflow: hidden;
  transform-origin: left top;
}

.loading-frame {
  display: block;
  width: 402px;
  height: 874px;
}

.linear-progress {
  position: absolute;
  top: 470px;
  left: 81px;
  box-sizing: border-box;
  width: 240px;
  height: 15px;
  overflow: hidden;
  border: 2px solid #000;
  border-radius: 50px;
  background: #8e8e8e;
}

.linear-progress__value {
  width: 100%;
  height: 100%;
  border-radius: 50px;
  background: #95dbfe;
  transform: scaleX(0);
  transform-origin: left center;
  animation: linear-progress 3.6s linear infinite;
}

@keyframes linear-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .linear-progress__value {
    animation: none;
    transform: scaleX(.5);
  }
}
</style>
