<template>
  <view class="debug-page">
    <view class="debug-shell">
      <view class="debug-header">
        <view>
          <text class="eyebrow">INTERACTION LAB</text>
          <text class="debug-title">脚牛马微交互调试</text>
        </view>
        <view class="status-chip"><view class="status-dot" /><text>开发中</text></view>
      </view>

      <view class="section-heading">
        <text class="section-index">01</text>
        <view><text class="section-title">晃动吊牌</text><text class="section-note">手机动作映射到顶部挂点</text></view>
      </view>

      <view class="motion-stage">
        <view class="lanyard" />
        <view class="clip"><view class="clip-line" /></view>
        <view
          :key="demoRun"
          class="work-badge"
          :class="{ 'work-badge--demo': state === 'demo', 'work-badge--reduced': reducedMotion }"
          :style="state === 'device' ? badgeStyle : undefined"
        >
          <view class="portrait-panel">
            <image src="/static/home/character.png" mode="aspectFit" />
          </view>
          <text class="badge-kicker">员工认证</text>
          <text class="badge-name">内卷型牛马</text>
          <view class="badge-meta"><text>高频出勤</text><text>行动力强</text></view>
          <view class="badge-footer"><text>NO. JNM-001</text><view class="mini-barcode" /></view>
        </view>
      </view>

      <view class="angle-readout">
        <text>当前角度</text><text>{{ angle.toFixed(1) }}°</text>
      </view>
      <view class="action-row">
        <button class="action-button action-button--primary" @click="playDemo">播放摆动</button>
        <button class="action-button" :class="{ 'action-button--active': state === 'device' }" @click="toggleDeviceMotion">
          {{ state === 'device' ? '停止设备感应' : '启用设备感应' }}
        </button>
      </view>
      <view class="setting-row">
        <view><text class="setting-title">减少动态效果</text><text class="setting-note">用于检查无动画降级</text></view>
        <switch color="#238bd0" :checked="reducedMotion" @change="onReducedMotionChange" />
      </view>
      <text v-if="errorMessage" class="error-message">{{ errorMessage }}</text>

      <view class="divider" />

      <view class="section-heading">
        <text class="section-index section-index--yellow">02</text>
        <view><text class="section-title">敲键盘认证</text><text class="section-note">左右手与键帽交替同步</text></view>
      </view>

      <view class="typing-stage" :class="{ 'typing-stage--paused': !typingActive || reducedMotion }">
        <view class="desk-scene">
          <view class="monitor"><view class="monitor-screen"><view class="code-line code-line--one" /><view class="code-line code-line--two" /></view><view class="monitor-stand" /></view>
          <view class="mascot-wrap">
            <image class="typing-mascot" src="/static/home/character.png" mode="aspectFit" />
            <view class="hoof hoof--left" />
            <view class="hoof hoof--right" />
          </view>
          <view class="keyboard">
            <view v-for="key in 9" :key="key" class="keyboard-key" :class="`keyboard-key--${key}`" />
          </view>
          <view class="briefcase" />
          <view class="desk" />
        </view>
        <text class="loading-copy">开启牛马认证<text class="loading-dots">......</text></text>
      </view>

      <view class="action-row action-row--typing">
        <button class="action-button action-button--primary" @click="typingActive = !typingActive">
          {{ typingActive ? '暂停敲键盘' : '继续敲键盘' }}
        </button>
        <button class="action-button" :loading="exporting" :disabled="exporting" @click="exportBadge">
          {{ exporting ? '正在生成' : '下载工牌样张' }}
        </button>
      </view>

      <view class="debug-notice">
        <text>调试说明</text>
        <text>当前用于确认动作节奏与双端能力；正式页面会继续对照 Figma 替换为最终图层和人物帧。</text>
      </view>
    </view>

    <canvas canvas-id="badgeExportCanvas" id="badgeExportCanvas" class="export-canvas" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBadgeMotion } from '../../composables/useBadgeMotion'
import { renderBadgeToTempFile, saveBadgeFile } from '../../services/badge-export'

const {
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
} = useBadgeMotion()

const typingActive = ref(true)
const exporting = ref(false)

const toggleDeviceMotion = () => {
  if (state.value === 'device') stopDeviceMotion()
  else startDeviceMotion()
}

const onReducedMotionChange = (event: Event) => {
  const switchEvent = event as Event & { detail: { value: boolean } }
  setReducedMotion(switchEvent.detail.value)
}

const exportBadge = async () => {
  if (exporting.value) return
  exporting.value = true

  try {
    const path = await renderBadgeToTempFile({
      title: '内卷型牛马',
      subtitle: '我超好用！',
      accent: '#2e90cd',
      fileName: '脚牛马-内卷型牛马-调试样张',
    })
    await saveBadgeFile(path, '脚牛马-内卷型牛马-调试样张')
    uni.showToast({ title: '工牌已生成', icon: 'success' })
  } catch {
    uni.showToast({ title: '生成失败，请稍后重试', icon: 'none' })
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
page { background: #e8e4dc; }

.debug-page {
  min-height: 100vh;
  padding: 24px 14px 48px;
  box-sizing: border-box;
  background: #e8e4dc;
  color: #173f5f;
}

.debug-shell {
  width: min(100%, 430px);
  margin: 0 auto;
  padding: 22px 18px 24px;
  box-sizing: border-box;
  border: 1px solid rgba(23, 63, 95, 0.18);
  border-radius: 28px;
  background: #faf7ef;
  box-shadow: 0 16px 42px rgba(44, 50, 55, 0.14);
}

.debug-header,
.section-heading,
.setting-row,
.angle-readout,
.action-row {
  display: flex;
  align-items: center;
}

.debug-header { justify-content: space-between; margin-bottom: 28px; }
.eyebrow { display: block; margin-bottom: 4px; color: #6d7d87; font-size: 11px; font-weight: 700; letter-spacing: 1.8px; }
.debug-title { display: block; font-size: 22px; font-weight: 800; letter-spacing: -0.4px; }
.status-chip { display: flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 99px; background: #e9f5fb; color: #287fae; font-size: 11px; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #2e90cd; box-shadow: 0 0 0 4px rgba(46, 144, 205, 0.12); }

.section-heading { gap: 12px; margin-bottom: 16px; }
.section-index { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 12px; background: #d9effb; color: #238bd0; font-size: 13px; font-weight: 800; }
.section-index--yellow { background: #fff0b9; color: #9b7515; }
.section-title, .section-note { display: block; }
.section-title { margin-bottom: 2px; font-size: 17px; font-weight: 800; }
.section-note { color: #73818a; font-size: 12px; }

.motion-stage {
  position: relative;
  height: 420px;
  overflow: hidden;
  border: 1px solid #d9e3e8;
  border-radius: 22px;
  background: linear-gradient(180deg, #eef8fd 0 42%, #fffdf8 42% 100%);
}

.lanyard { position: absolute; z-index: 1; top: -20px; left: 50%; width: 38px; height: 126px; border: 2px solid #1f86c4; border-radius: 5px; background: #69b8e9; transform: translateX(-50%); }
.lanyard::after { content: ''; position: absolute; right: 8px; top: 0; width: 1px; height: 100%; border-left: 1px dashed rgba(23, 63, 95, 0.5); }
.clip { position: absolute; z-index: 4; top: 88px; left: 50%; width: 54px; height: 45px; border: 3px solid #25313a; border-radius: 8px; background: #fff; transform: translateX(-50%); }
.clip-line { position: absolute; right: 5px; bottom: 7px; left: 5px; height: 3px; border-radius: 3px; background: #d2d2d2; }

.work-badge {
  position: absolute;
  z-index: 2;
  top: 112px;
  left: 50%;
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 274px;
  padding: 20px 18px 14px;
  box-sizing: border-box;
  border: 3px solid #2e90cd;
  border-radius: 18px;
  background: #dff3fd;
  box-shadow: 0 14px 25px rgba(20, 75, 107, 0.17);
  transform: translateX(-50%);
  transform-origin: 50% 0;
  transition: transform 80ms ease-out;
}

.work-badge--demo { animation: badge-swing 1.45s cubic-bezier(0.22, 0.8, 0.24, 1) both; }
.work-badge--reduced { animation: none; transform: translateX(-50%) rotate(0deg) !important; transition: none; }
.portrait-panel { display: flex; align-items: center; justify-content: center; height: 124px; border: 1px solid #7fb7d7; border-radius: 10px; background: #f8fcfe; }
.portrait-panel image { width: 126px; height: 126px; }
.badge-kicker { margin-top: 12px; color: #4f7083; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; }
.badge-name { margin-top: 2px; font-size: 25px; font-weight: 900; letter-spacing: -0.8px; }
.badge-meta { display: flex; gap: 7px; margin-top: 8px; }
.badge-meta text { padding: 4px 8px; border-radius: 99px; background: rgba(255, 255, 255, 0.72); color: #4b6a7d; font-size: 11px; }
.badge-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; color: #567484; font-size: 9px; }
.mini-barcode { width: 62px; height: 12px; background: repeating-linear-gradient(90deg, #2e83bc 0 2px, transparent 2px 4px, #2e83bc 4px 5px, transparent 5px 8px); }

.angle-readout { justify-content: space-between; margin: 12px 2px 10px; color: #6f7c84; font-size: 12px; font-variant-numeric: tabular-nums; }
.angle-readout text:last-child { color: #173f5f; font-weight: 800; }
.action-row { gap: 10px; }
.action-button { flex: 1; min-height: 48px; margin: 0; padding: 0 12px; border: 1px solid #238bd0; border-radius: 13px; background: transparent; color: #238bd0; font-size: 14px; font-weight: 700; line-height: 48px; touch-action: manipulation; }
.action-button::after { border: 0; }
.action-button:active { opacity: 0.84; transform: scale(0.98); }
.action-button--primary, .action-button--active { background: #238bd0; color: #fff; }
.setting-row { justify-content: space-between; margin-top: 12px; padding: 12px 14px; border-radius: 14px; background: #f1eee6; }
.setting-title, .setting-note { display: block; }
.setting-title { font-size: 13px; font-weight: 700; }
.setting-note { margin-top: 2px; color: #7b817f; font-size: 11px; }
.error-message { display: block; margin-top: 10px; padding: 10px 12px; border-radius: 10px; background: #fff0df; color: #895116; font-size: 12px; line-height: 1.5; }
.divider { height: 1px; margin: 28px 0; background: #dedbd3; }

.typing-stage { padding: 20px 12px 16px; border: 1px solid #dedbd3; border-radius: 22px; background: #fffdf8; }
.desk-scene { position: relative; width: 100%; height: 205px; }
.monitor { position: absolute; z-index: 2; left: 28px; bottom: 46px; width: 92px; height: 86px; }
.monitor-screen { width: 86px; height: 56px; padding: 12px 9px; box-sizing: border-box; border: 3px solid #2f3840; border-radius: 7px; background: #8e93a4; transform: skewY(6deg); }
.code-line { height: 4px; margin-bottom: 7px; border-radius: 4px; background: #d7effb; animation: code-pulse 1.2s ease-in-out infinite alternate; }
.code-line--one { width: 50px; }
.code-line--two { width: 35px; animation-delay: 0.35s; }
.monitor-stand { width: 36px; height: 25px; margin: 0 auto; border-bottom: 6px solid #303940; transform: skew(-8deg); }
.mascot-wrap { position: absolute; z-index: 3; bottom: 42px; left: 50%; width: 132px; height: 145px; transform: translateX(-50%); }
.typing-mascot { width: 132px; height: 132px; animation: mascot-bob 0.48s ease-in-out infinite alternate; }
.hoof { position: absolute; z-index: 5; bottom: 10px; width: 27px; height: 20px; border: 3px solid #1f2c35; border-radius: 50%; background: #79c9ee; transform-origin: 50% 0; }
.hoof--left { left: 32px; animation: type-left 0.48s ease-in-out infinite; }
.hoof--right { right: 30px; animation: type-right 0.48s ease-in-out infinite; }
.keyboard { position: absolute; z-index: 4; bottom: 36px; left: 50%; display: grid; grid-template-columns: repeat(9, 1fr); gap: 3px; width: 132px; height: 29px; padding: 5px; box-sizing: border-box; border: 3px solid #303940; border-radius: 7px; background: #d8d6d0; transform: translateX(-35%); }
.keyboard-key { border-radius: 2px; background: #727982; box-shadow: 0 2px 0 #333a40; }
.keyboard-key:nth-child(odd) { animation: key-left 0.48s ease-in-out infinite; }
.keyboard-key:nth-child(even) { animation: key-right 0.48s ease-in-out infinite; }
.briefcase { position: absolute; z-index: 2; right: 24px; bottom: 43px; width: 54px; height: 58px; border: 3px solid #303940; border-radius: 7px; background: #766f65; }
.briefcase::before { content: ''; position: absolute; top: -13px; left: 15px; width: 20px; height: 12px; border: 3px solid #303940; border-bottom: 0; border-radius: 5px 5px 0 0; }
.desk { position: absolute; z-index: 1; right: 12px; bottom: 28px; left: 12px; height: 18px; border: 3px solid #303940; border-radius: 12px; background: #8ad1ef; }
.loading-copy { display: block; margin-top: -4px; text-align: center; color: #656565; font-size: 16px; font-weight: 600; }
.loading-dots { display: inline-block; width: 34px; overflow: hidden; vertical-align: bottom; animation: dots 1.2s steps(4, end) infinite; }
.typing-stage--paused * { animation-play-state: paused !important; }
.action-row--typing { margin-top: 12px; }
.debug-notice { margin-top: 22px; padding: 14px; border-left: 4px solid #e5bd42; border-radius: 0 12px 12px 0; background: #fff5d4; }
.debug-notice text { display: block; }
.debug-notice text:first-child { margin-bottom: 4px; color: #6b5412; font-size: 12px; font-weight: 800; }
.debug-notice text:last-child { color: #75662e; font-size: 11px; line-height: 1.55; }
.export-canvas { position: fixed; top: 0; left: -10000px; width: 600px; height: 840px; pointer-events: none; }

@keyframes badge-swing {
  0% { transform: translateX(-50%) rotate(0deg); }
  18% { transform: translateX(-50%) rotate(13deg); }
  38% { transform: translateX(-50%) rotate(-10deg); }
  57% { transform: translateX(-50%) rotate(7deg); }
  73% { transform: translateX(-50%) rotate(-4deg); }
  87% { transform: translateX(-50%) rotate(2deg); }
  100% { transform: translateX(-50%) rotate(0deg); }
}
@keyframes mascot-bob { to { transform: translateY(2px); } }
@keyframes type-left { 0%, 45% { transform: translateY(0) rotate(0); } 50%, 100% { transform: translateY(8px) rotate(8deg); } }
@keyframes type-right { 0%, 45% { transform: translateY(8px) rotate(-8deg); } 50%, 100% { transform: translateY(0) rotate(0); } }
@keyframes key-left { 0%, 45% { transform: translateY(0); box-shadow: 0 2px 0 #333a40; } 50%, 100% { transform: translateY(2px); box-shadow: 0 0 0 #333a40; } }
@keyframes key-right { 0%, 45% { transform: translateY(2px); box-shadow: 0 0 0 #333a40; } 50%, 100% { transform: translateY(0); box-shadow: 0 2px 0 #333a40; } }
@keyframes code-pulse { to { opacity: 0.45; } }
@keyframes dots { from { width: 0; } to { width: 34px; } }

@media (prefers-reduced-motion: reduce) {
  .work-badge,
  .typing-stage *,
  .loading-dots { animation: none !important; transition: none !important; }
}

@media (max-width: 359px) {
  .debug-page { padding-right: 8px; padding-left: 8px; }
  .debug-shell { padding-right: 14px; padding-left: 14px; border-radius: 22px; }
  .action-row { flex-direction: column; }
  .action-button { width: 100%; }
}
</style>
