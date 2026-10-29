<template>
  <view class="question-page">
    <view class="question-stage" :style="stageStyle">
      <view class="question-canvas" :style="canvasStyle">
        <image class="question-artwork" :src="question.image" mode="widthFix" draggable="false" />

        <!-- 用吊牌自身的透明轮廓遮住整页截图里的静态吊牌，不产生矩形裁切边。 -->
        <view
          v-for="area in question.answers"
          :key="`mask-${area.id}`"
          class="tag-mask"
          :style="maskStyle(area)"
          aria-hidden="true"
        />

        <view
          v-for="(area, index) in question.answers"
          :key="`tag-${area.id}`"
          class="tag-shell"
          :style="tagShellStyle(area, index)"
          aria-hidden="true"
        >
          <image
            class="question-tag"
            :class="[
              `question-tag--${area.id.toLowerCase()}`,
              { 'question-tag--active': activeAnswerId === area.id },
            ]"
            :src="area.tagImage"
            mode="scaleToFill"
            draggable="false"
          />
        </view>

        <view
          v-for="(area, index) in question.answers"
          :key="`hit-${area.id}`"
          class="answer-hitbox"
          :style="answerStyle(area, index)"
          role="button"
          :aria-label="`选择 ${area.id}`"
          @touchstart="ensureDeviceMotion"
          @tap="chooseAnswer(area.id)"
        />
        <view class="close-hitbox" role="button" aria-label="返回首页" @tap="returnHome" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useBadgeMotion } from '@/composables/useBadgeMotion'

type AnswerId = 'A' | 'B'

type AnswerArea = {
  id: AnswerId
  tagImage: string
  x: number
  y: number
  width: number
  height: number
}

type Question = {
  image: string
  answers: AnswerArea[]
}

const DESIGN_WIDTH = 402
const DESIGN_HEIGHT = 874
const answersStorageKey = 'jiao-niu-ma:answers'

const questionMap: Record<number, Question> = {
  1: {
    image: '/static/figma/questions/q1.png',
    answers: [
      { id: 'A', tagImage: '/static/figma/question-tags/q1-a-transparent.png', x: 9, y: 315, width: 213, height: 367 },
      { id: 'B', tagImage: '/static/figma/question-tags/q1-b-transparent.png', x: 195, y: 422, width: 182, height: 337 },
    ],
  },
  2: {
    image: '/static/figma/questions/q2.png',
    answers: [
      { id: 'A', tagImage: '/static/figma/question-tags/q2-a-transparent.png', x: 17, y: 318, width: 375, height: 244 },
      { id: 'B', tagImage: '/static/figma/question-tags/q2-b-transparent.png', x: 17, y: 544, width: 369, height: 233 },
    ],
  },
  3: {
    image: '/static/figma/questions/q3.png',
    answers: [
      { id: 'A', tagImage: '/static/figma/question-tags/q3-a-transparent.png', x: 0, y: 406, width: 220, height: 353 },
      { id: 'B', tagImage: '/static/figma/question-tags/q3-b-transparent.png', x: 187, y: 320, width: 216, height: 344 },
    ],
  },
  4: {
    image: '/static/figma/questions/q4.png',
    answers: [
      { id: 'A', tagImage: '/static/figma/question-tags/q4-a-transparent.png', x: 21, y: 451, width: 208, height: 361 },
      { id: 'B', tagImage: '/static/figma/question-tags/q4-b-transparent.png', x: 160, y: 296, width: 233, height: 363 },
    ],
  },
  5: {
    image: '/static/figma/questions/q5-a.png',
    answers: [
      { id: 'A', tagImage: '/static/figma/question-tags/q5a-a-transparent.png', x: 15, y: 327, width: 189, height: 376 },
      { id: 'B', tagImage: '/static/figma/question-tags/q5a-b-transparent.png', x: 159, y: 408, width: 243, height: 408 },
    ],
  },
}

const question5B: Question = {
  image: '/static/figma/questions/q5-b.png',
  answers: [
    { id: 'A', tagImage: '/static/figma/question-tags/q5b-a-transparent.png', x: 14, y: 325, width: 192, height: 381 },
    { id: 'B', tagImage: '/static/figma/question-tags/q5b-b-transparent.png', x: 152, y: 404, width: 246, height: 413 },
  ],
}

const step = ref(1)
const isNavigating = ref(false)
const activeAnswerId = ref<AnswerId | null>(null)
const motionRequested = ref(false)
const { angle, setReducedMotion, startDeviceMotion } = useBadgeMotion()

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
const question = computed(() => {
  if (step.value !== 5) return questionMap[step.value] ?? questionMap[1]

  const answers = uni.getStorageSync(answersStorageKey) as Record<string, AnswerId> | ''
  return typeof answers === 'object' && answers?.q1 === 'B' ? question5B : questionMap[5]
})

onLoad((options) => {
  const requestedStep = Number(options?.step ?? 1)
  if (Number.isInteger(requestedStep) && questionMap[requestedStep]) step.value = requestedStep
})

onMounted(() => {
  // #ifdef H5
  if (typeof window.matchMedia === 'function') {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }
  const MotionEvent = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  if (typeof MotionEvent?.requestPermission !== 'function') {
    void ensureDeviceMotion()
  }
  // #endif

  // 微信小程序可直接启用加速度计；H5/iOS 在用户首次触摸吊牌时请求权限。
  // #ifdef MP-WEIXIN
  void ensureDeviceMotion()
  // #endif
})

function basePosition(area: AnswerArea, zIndex: number) {
  return {
    left: `${area.x}px`,
    top: `${area.y}px`,
    width: `${area.width}px`,
    height: `${area.height}px`,
    zIndex,
  }
}

function maskStyle(area: AnswerArea) {
  // Q2 A 直接复用 Figma「长班制」吊牌本体的透明轮廓：左上斜切、圆角、孔位和阴影边界都与牌面一一对应。
  // 其余吊牌使用各自的 Figma 轮廓遮罩；不以矩形或通用裁切区清除底图。
  const isQ2LongShift = area.tagImage.endsWith('/q2-a-transparent.png')
  const fittedMask = isQ2LongShift
    ? area.tagImage
    : area.tagImage.replace('-transparent.png', '-mask.png')
  return {
    ...basePosition(area, 1),
    WebkitMaskImage: `url(${fittedMask})`,
    maskImage: `url(${fittedMask})`,
    // 同一张 Figma 牌型仅等比放大，给静态底图与轻摆位置之间留出安全边；不是矩形遮罩。
    WebkitMaskSize: isQ2LongShift ? '108% 108%' : '100% 100%',
    maskSize: isQ2LongShift ? '108% 108%' : '100% 100%',
  }
}

function tagShellStyle(area: AnswerArea, index: number) {
  const gyroAngle = angle.value * (index === 0 ? 1 : .86)
  return {
    ...basePosition(area, index + 3),
    transform: `rotate(${gyroAngle.toFixed(2)}deg)`,
  }
}

function answerStyle(area: AnswerArea, index: number) {
  return basePosition(area, index + 7)
}

async function ensureDeviceMotion() {
  if (motionRequested.value) return
  motionRequested.value = true
  await startDeviceMotion()
}

function chooseAnswer(answer: AnswerId) {
  if (isNavigating.value) return
  void ensureDeviceMotion()
  isNavigating.value = true
  activeAnswerId.value = answer

  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'light' })
  // #endif

  const previous = uni.getStorageSync(answersStorageKey) as Record<string, AnswerId> | ''
  const answers = {
    ...(typeof previous === 'object' && previous ? previous : {}),
    [`q${step.value}`]: answer,
  }
  uni.setStorageSync(answersStorageKey, answers)

  setTimeout(() => {
    if (step.value < 5) {
      uni.redirectTo({ url: `/pages/questions/index?step=${step.value + 1}` })
      return
    }

    const q1Answer = answers.q1 === 'B' ? 'B' : 'A'
    const resultMap = {
      A: { A: 'involution', B: 'showoff' },
      B: { A: 'love-feet', B: 'steady' },
    } as const
    uni.redirectTo({ url: `/pages/matching/index?result=${resultMap[q1Answer][answer]}` })
  }, 320)
}

function returnHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
page { background: #000; }

.question-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

.question-stage {
  position: relative;
  flex: none;
  animation: screen-enter .28s ease-out both;
}

.question-canvas {
  position: relative;
  width: 402px;
  height: 874px;
  overflow: hidden;
  transform-origin: left top;
}

.question-artwork {
  position: relative;
  z-index: 0;
  display: block;
  width: 402px;
  height: 874px;
}

.tag-mask,
.tag-shell,
.answer-hitbox,
.close-hitbox {
  position: absolute;
}

.tag-mask {
  background: #faf7ef;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  pointer-events: none;
}

.tag-shell {
  transform-origin: 50% 7%;
  transition: transform 90ms linear;
  pointer-events: none;
}

.question-tag {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: 50% 7%;
  filter: drop-shadow(0 0 .8px rgba(30, 44, 50, .72));
}

.question-tag--a { animation: tag-breeze-a 3.4s ease-in-out infinite alternate; }
.question-tag--b { animation: tag-breeze-b 4.1s ease-in-out -.8s infinite alternate; }
.question-tag--active { animation: tag-confirm .3s cubic-bezier(.2, .8, .3, 1) both; }

.answer-hitbox,
.close-hitbox {
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}

.close-hitbox { top: 57px; left: 14px; width: 30px; height: 30px; z-index: 12; }

@keyframes screen-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tag-breeze-a {
  from { transform: rotate(-1.1deg) translateY(0); }
  to { transform: rotate(1.25deg) translateY(1px); }
}

@keyframes tag-breeze-b {
  from { transform: rotate(1deg) translateY(.5px); }
  to { transform: rotate(-1.35deg) translateY(-.5px); }
}

@keyframes tag-confirm {
  0% { filter: brightness(1); transform: rotate(0) scale(1); }
  42% { filter: brightness(1.1); transform: rotate(2.5deg) scale(.975); }
  100% { filter: brightness(1); transform: rotate(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .question-stage,
  .question-tag { animation: none; }
  .tag-shell { transition: none; }
}
</style>
