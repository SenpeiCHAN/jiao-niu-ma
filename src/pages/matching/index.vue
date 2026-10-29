<template>
  <FigmaTypingLoading :frames="matchingFrames" label="正在匹配人格" auto-complete @complete="goToResult" />
</template>

<script setup lang="ts">
import FigmaTypingLoading from '@/components/FigmaTypingLoading.vue'
import { onLoad } from '@dcloudio/uni-app'

type ResultKey = 'involution' | 'showoff' | 'steady' | 'love-feet'

const matchingFrames = [
  '/static/figma/matching/matching-frame-1.png',
  '/static/figma/matching/matching-frame-2.png',
  '/static/figma/matching/matching-frame-3.png',
] as const

let resultKey: ResultKey = 'involution'

onLoad((options) => {
  const requestedKey = options?.result as ResultKey | undefined
  if (requestedKey && ['involution', 'showoff', 'steady', 'love-feet'].includes(requestedKey)) {
    resultKey = requestedKey
  }
})

function goToResult() {
  uni.redirectTo({ url: `/pages/results/index?type=${resultKey}` })
}
</script>
