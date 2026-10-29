<template>
  <FigmaTypingLoading :frames="loadingFrames" label="开启牛马认证" auto-complete @complete="goToQuestions" />
</template>

<script setup lang="ts">
import FigmaTypingLoading from '@/components/FigmaTypingLoading.vue'

const loadingFrames = [
  '/static/figma/loading/loading-frame-1.png',
  '/static/figma/loading/loading-frame-2.png',
  '/static/figma/loading/loading-frame-3.png',
] as const

function goToQuestions() {
  uni.redirectTo({ url: '/pages/questions/index?step=1' })
}
</script>
