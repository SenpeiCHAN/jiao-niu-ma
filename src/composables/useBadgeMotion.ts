import { computed, onBeforeUnmount, ref } from 'vue'

type AccelerometerSample = {
  x: number
  y: number
  z: number
}

type MotionState = 'idle' | 'demo' | 'device'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export const useBadgeMotion = () => {
  const angle = ref(0)
  const state = ref<MotionState>('idle')
  const demoRun = ref(0)
  const reducedMotion = ref(false)
  const errorMessage = ref('')
  let deviceMotionBound = false
  let smoothedAngle = 0

  const badgeStyle = computed(() => ({
    transform: `translateX(-50%) rotate(${angle.value.toFixed(2)}deg)`,
  }))

  const stopDeviceMotion = () => {
    if (!deviceMotionBound) return

    uni.offAccelerometerChange(onAccelerometerChange)
    uni.stopAccelerometer()
    deviceMotionBound = false
    smoothedAngle = 0
    angle.value = 0
    if (state.value === 'device') state.value = 'idle'
  }

  const onAccelerometerChange = (sample: AccelerometerSample) => {
    if (reducedMotion.value || state.value !== 'device') return

    const targetAngle = clamp(sample.x * 7, -14, 14)
    smoothedAngle += (targetAngle - smoothedAngle) * 0.24
    angle.value = smoothedAngle
  }

  const requestMotionPermission = async () => {
    // #ifdef H5
    const MotionEvent = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }

    if (typeof MotionEvent?.requestPermission === 'function') {
      return (await MotionEvent.requestPermission()) === 'granted'
    }
    // #endif

    return true
  }

  const startDeviceMotion = async () => {
    errorMessage.value = ''
    if (reducedMotion.value) {
      errorMessage.value = '已开启“减少动态效果”，设备晃动不会驱动吊牌。'
      return
    }

    try {
      const permitted = await requestMotionPermission()
      if (!permitted) {
        errorMessage.value = '未获得动作与方向权限，可继续使用“播放摆动”按钮预览。'
        return
      }

      uni.onAccelerometerChange(onAccelerometerChange)
      deviceMotionBound = true
      uni.startAccelerometer({
        interval: 'game',
        success: () => {
          state.value = 'device'
        },
        fail: () => {
          stopDeviceMotion()
          errorMessage.value = '当前浏览器没有提供可用的加速度数据，请使用手动摆动预览。'
        },
      })
    } catch {
      stopDeviceMotion()
      errorMessage.value = '动作权限请求失败，请检查浏览器权限或使用手动摆动预览。'
    }
  }

  const playDemo = () => {
    stopDeviceMotion()
    if (reducedMotion.value) {
      angle.value = 0
      state.value = 'idle'
      return
    }

    state.value = 'demo'
    demoRun.value += 1
    setTimeout(() => {
      if (state.value === 'demo') state.value = 'idle'
    }, 1500)
  }

  const setReducedMotion = (enabled: boolean) => {
    reducedMotion.value = enabled
    if (enabled) stopDeviceMotion()
  }

  onBeforeUnmount(stopDeviceMotion)

  return {
    angle,
    badgeStyle,
    demoRun,
    errorMessage,
    reducedMotion,
    state,
    playDemo,
    setReducedMotion,
    startDeviceMotion,
    stopDeviceMotion,
  }
}
