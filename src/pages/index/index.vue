<template>
  <view class="home-page">
    <view class="home-stage" :style="stageStyle">
    <view class="home-canvas" :style="canvasStyle">
      <view class="status-bar">
        <text class="time">9:41</text>
        <view class="dynamic-island" />
        <view class="signal" aria-hidden="true">
          <view v-for="bar in 4" :key="bar" :class="`signal-bar signal-bar--${bar}`" />
        </view>
        <image class="wifi" src="/static/home/status-wifi.svg" mode="aspectFit" />
        <image class="battery" src="/static/home/status-battery.svg" mode="aspectFit" />
        <image class="close" src="/static/home/close.svg" mode="aspectFit" />
        <image class="more" src="/static/home/more.svg" mode="aspectFit" />
      </view>

      <view class="headline">
        <text>你的脚，</text>
        <text>是什么类型的牛马？</text>
      </view>
      <image class="headline-spark" src="/static/home/spark.png" mode="aspectFit" />

      <view class="rope-crop rope-crop--left">
        <image src="/static/home/rope.png" mode="scaleToFill" />
      </view>
      <view class="rope-crop rope-crop--right">
        <image src="/static/home/rope.png" mode="scaleToFill" />
      </view>
      <view class="rope-crop rope-crop--lower">
        <image src="/static/home/rope.png" mode="scaleToFill" />
      </view>

      <view class="blue-card-group" aria-hidden="true">
        <view class="blue-shape-wrap">
          <image class="blue-shape" src="/static/home/tag-blue.svg" mode="scaleToFill" />
        </view>
        <view class="blue-photo-panel" />
        <image class="blue-badge-outer" src="/static/home/badge-outer.svg" mode="aspectFit" />
        <image class="blue-badge-inner" src="/static/home/badge-inner.svg" mode="aspectFit" />
        <image class="character" src="/static/home/character.png" mode="aspectFit" />
        <image class="blue-label" src="/static/home/unknown-1.svg" mode="aspectFit" />
        <image class="blue-description" src="/static/home/unknown-2.svg" mode="aspectFit" />
        <image class="blue-caption" src="/static/home/unknown-3.svg" mode="aspectFit" />
        <view class="blue-barcode" />
      </view>

      <view class="yellow-card-group" aria-hidden="true">
        <view class="yellow-shape-wrap">
          <image class="yellow-shape" src="/static/home/tag-yellow.svg" mode="scaleToFill" />
        </view>
        <view class="spark-wrap spark-wrap--top">
          <image src="/static/home/spark.png" mode="scaleToFill" />
        </view>
        <view class="spark-wrap spark-wrap--bottom">
          <image src="/static/home/spark.png" mode="scaleToFill" />
        </view>
        <image class="yellow-badge-outer" src="/static/home/tag-hole-outer.svg" mode="aspectFit" />
        <image class="yellow-badge-inner" src="/static/home/tag-hole-inner.svg" mode="aspectFit" />
        <view class="shoes-wrap">
          <view class="shoes-crop">
            <image src="/static/home/shoes.png" mode="scaleToFill" />
          </view>
        </view>
        <view class="shoe-colleague-wrap">
          <image src="/static/home/shoe-colleague.svg" mode="aspectFit" />
        </view>
        <view class="partner-copy-wrap"><text>和脚并肩前行的</text></view>
        <view class="best-partner-wrap">
          <image src="/static/home/best-partner.svg" mode="aspectFit" />
        </view>
        <view class="yellow-barcode" />
      </view>

      <button class="start-button" @click="startQuiz">
        <text>测测我的脚牛马人格</text>
        <image src="/static/home/arrow.svg" mode="aspectFit" />
      </button>
      <text class="hint">5道题 生成专属报告 匹配鞋同事</text>
      <view class="home-indicator" />
    </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const DESIGN_WIDTH = 402
const DESIGN_HEIGHT = 874
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
const canvasStyle = {
  transform: `scale(${pageScale})`,
}

const startQuiz = () => {
  uni.navigateTo({ url: '/pages/loading/index' })
}
</script>

<style scoped>
page {
  background: #000;
}

.home-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background: #000;
  overflow: hidden;
}

.home-stage {
  position: relative;
  flex: none;
}

.home-canvas {
  position: relative;
  width: 402px;
  height: 874px;
  overflow: hidden;
  background: #faf7ef;
  color: #1c2e3b;
  border-radius: 64px;
  transform-origin: left top;
}

.status-bar {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 98px;
  background: #ededed;
}

.time {
  position: absolute;
  top: 23px;
  left: 61px;
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
  color: #000;
}

.dynamic-island {
  position: absolute;
  top: 15px;
  left: 50%;
  width: 95px;
  height: 37px;
  border-radius: 99px;
  background: #000;
  transform: translateX(-50%);
}

.signal {
  position: absolute;
  top: 28px;
  right: 101px;
  display: flex;
  align-items: end;
  gap: 2px;
  height: 14px;
}

.signal-bar {
  width: 3px;
  border-radius: 2px;
  background: #000;
}

.signal-bar--1 { height: 6px; }
.signal-bar--2 { height: 9px; }
.signal-bar--3 { height: 11px; }
.signal-bar--4 { height: 14px; }

.wifi, .battery, .close, .more {
  position: absolute;
}

.wifi { top: 26px; right: 70px; width: 19px; height: 15px; }
.battery { top: 26px; right: 34px; width: 29px; height: 14px; }
.close { top: 60px; left: 17px; width: 23px; height: 23px; }
.more { top: 57px; right: 15px; width: 28px; height: 28px; }

.headline {
  position: absolute;
  z-index: 5;
  top: 136px;
  left: 35px;
  display: flex;
  flex-direction: column;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -1.5px;
}

.headline-spark {
  position: absolute;
  z-index: 5;
  top: 134px;
  left: 198px;
  width: 38px;
  height: 48px;
}

.rope-crop {
  position: absolute;
  z-index: 1;
  overflow: hidden;
}

.rope-crop image {
  position: absolute;
  max-width: none;
}

.rope-crop--left { top: 106px; left: -14px; width: 126px; height: 260px; }
.rope-crop--left image { top: -59px; left: -42px; width: 559px; height: 800px; }
.rope-crop--right { top: 234px; left: 173px; width: 212px; height: 262px; }
.rope-crop--right image { top: -161.3px; left: -231.7px; width: 526px; height: 754.6px; }
.rope-crop--lower { top: 491px; left: -56px; width: 237.1px; height: 111.55px; transform: rotate(3.02deg); }
.rope-crop--lower image { top: -410px; left: -49px; width: 505.5px; height: 725.4px; }

.blue-card-group,
.yellow-card-group {
  position: absolute;
  inset: 0;
  width: 402px;
  height: 874px;
  pointer-events: none;
}

.yellow-card-group {
  z-index: 2;
  transform-origin: 136px 550px;
  animation: yellow-card-idle-sway 5.1s ease-in-out infinite alternate;
}

.blue-card-group {
  z-index: 3;
  transform-origin: 92px 281px;
  animation: blue-card-idle-sway 4.4s ease-in-out -.6s infinite alternate;
}

.blue-shape-wrap {
  position: absolute;
  z-index: 4;
  top: 230px;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 247.54px;
  height: 296px;
}

.blue-shape {
  width: 208px;
  height: 264px;
  transform: rotate(-8.5deg);
}

.blue-photo-panel {
  position: absolute;
  z-index: 4;
  top: 318px;
  left: 38px;
  width: 185px;
  height: 137px;
  border: 1px solid #2e90cd;
  border-radius: 5px;
  background: #f8fcfe;
  transform: rotate(-8.5deg);
}

.character {
  position: absolute;
  z-index: 5;
  top: 283px;
  left: 64px;
  width: 190px;
  height: 190px;
}

.blue-badge-outer, .blue-badge-inner {
  position: absolute;
  z-index: 5;
}

.blue-badge-outer { top: 267.96px; left: 73.94px; width: 33.37px; height: 33.37px; }
.blue-badge-inner { top: 272.38px; left: 79.83px; width: 21.59px; height: 21.59px; }
.blue-label { position: absolute; z-index: 5; top: 436.24px; left: 52.13px; width: 55.88px; height: 24px; }
.blue-description { position: absolute; z-index: 5; top: 459.75px; left: 55.71px; width: 71.62px; height: 19.39px; }
.blue-caption { position: absolute; z-index: 5; top: 476.14px; left: 88.43px; width: 40.61px; height: 14.97px; }

.blue-barcode,
.yellow-barcode {
  position: absolute;
  z-index: 3;
  height: 16px;
  background: repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 5px, currentColor 5px 6px, transparent 6px 9px);
}

.blue-barcode { top: 477px; left: 159px; width: 80px; color: #2e83bc; transform: rotate(-8.5deg); }
.blue-barcode { z-index: 5; }

.yellow-shape-wrap {
  position: absolute;
  z-index: 2;
  top: 431.01px;
  left: 98.11px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 299.77px;
  height: 273.02px;
}

.yellow-shape { width: 175.47px; height: 245.3px; transform: rotate(60.72deg); }

.yellow-badge-outer, .yellow-badge-inner {
  position: absolute;
  z-index: 3;
}

.yellow-badge-outer { top: 536.48px; left: 118.04px; width: 37.22px; height: 37.22px; }
.yellow-badge-inner { top: 542.68px; left: 124.25px; width: 24.81px; height: 24.81px; }

.spark-wrap {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spark-wrap image { width: 25.25px; height: 35.94px; }
.spark-wrap--top { top: 472.68px; left: 263.52px; width: 43.82px; height: 40.21px; }
.spark-wrap--top image { transform: rotate(-58.81deg); }
.spark-wrap--bottom { top: 589.84px; left: 298.6px; width: 42.95px; height: 43.52px; }
.spark-wrap--bottom image { transform: rotate(137.14deg); }

.shoes-wrap,
.shoe-colleague-wrap,
.partner-copy-wrap,
.best-partner-wrap {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shoes-wrap { top: 461.79px; left: 204.58px; width: 183.25px; height: 177.5px; }
.shoes-crop { position: relative; width: 140px; height: 125px; overflow: hidden; transform: rotate(-29.28deg); }
.shoes-crop image { position: absolute; top: -0.31px; left: -35px; width: 195.47px; height: 125.64px; max-width: none; }
.shoe-colleague-wrap { top: 571.79px; left: 143.61px; width: 58.78px; height: 43.89px; }
.shoe-colleague-wrap image { width: 57.14px; height: 18.28px; transform: rotate(-29.28deg); }
.partner-copy-wrap { top: 585.91px; left: 157.66px; width: 80.71px; height: 55.42px; }
.partner-copy-wrap text { color: #5e5e5e; font-size: 12px; white-space: nowrap; transform: rotate(-29.28deg); }
.best-partner-wrap { top: 603.96px; left: 197.57px; width: 45.53px; height: 32.15px; }
.best-partner-wrap image { width: 45.99px; height: 11.08px; transform: rotate(-29.28deg); }
.yellow-barcode { top: 650px; left: 181px; width: 78px; color: #b49349; transform: rotate(-29.28deg); }

.start-button {
  position: absolute;
  z-index: 6;
  right: 42px;
  bottom: 89px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 322px;
  height: 66px;
  padding: 0;
  border: 1px solid #2e83bc;
  border-radius: 15px;
  background: #238bd0;
  box-shadow: none;
  color: #fff;
  font-size: 20px;
  font-weight: 500;
  line-height: 66px;
}

.start-button::after { border: 0; }
.start-button:active { opacity: 0.9; transform: scale(0.985); }
.start-button image { width: 22px; height: 21px; }
.hint { position: absolute; z-index: 5; right: 0; bottom: 60px; left: 0; text-align: center; color: #9d9d9d; font-size: 12px; }
.home-indicator { position: absolute; z-index: 5; bottom: 8px; left: 50%; width: 144px; height: 5px; border-radius: 8px; background: #000; transform: translateX(-50%); }

@keyframes blue-card-idle-sway {
  from { transform: rotate(-.8deg); }
  to { transform: rotate(.95deg); }
}

@keyframes yellow-card-idle-sway {
  from { transform: rotate(.65deg); }
  to { transform: rotate(-.85deg); }
}

@media (prefers-reduced-motion: reduce) {
  .blue-card-group,
  .yellow-card-group { animation: none; }
}

@media (max-width: 401px) {
  .home-canvas { border-radius: 48px; }
}
</style>
