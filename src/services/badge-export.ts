export type BadgeExportPayload = {
  title: string
  subtitle: string
  accent: string
  fileName: string
}

const canvasId = 'badgeExportCanvas'

export const renderBadgeToTempFile = (payload: BadgeExportPayload) => new Promise<string>((resolve, reject) => {
  const context = uni.createCanvasContext(canvasId)

  context.setFillStyle('#fffdf7')
  context.fillRect(0, 0, 600, 840)

  context.setFillStyle(payload.accent)
  context.fillRect(0, 0, 600, 132)
  context.setFillStyle('#ffffff')
  context.fillRect(268, 0, 64, 118)
  context.setStrokeStyle('#1f2c35')
  context.setLineWidth(6)
  context.strokeRect(32, 112, 536, 680)

  context.setFillStyle('#e9f7ff')
  context.fillRect(76, 188, 448, 298)
  context.setStrokeStyle(payload.accent)
  context.setLineWidth(4)
  context.strokeRect(76, 188, 448, 298)

  context.setFillStyle(payload.accent)
  context.beginPath()
  context.arc(300, 338, 112, 0, Math.PI * 2)
  context.fill()
  context.setFillStyle('#ffffff')
  context.beginPath()
  context.arc(262, 318, 9, 0, Math.PI * 2)
  context.arc(338, 318, 9, 0, Math.PI * 2)
  context.fill()
  context.setStrokeStyle('#ffffff')
  context.setLineWidth(7)
  context.beginPath()
  context.arc(300, 344, 44, 0.15, Math.PI - 0.15)
  context.stroke()

  context.setFillStyle('#173f5f')
  context.setFontSize(48)
  context.setTextAlign('center')
  context.fillText(payload.title, 300, 566)
  context.setFillStyle('#53636e')
  context.setFontSize(28)
  context.fillText(payload.subtitle, 300, 620)

  context.setFillStyle(payload.accent)
  context.fillRect(74, 690, 452, 16)
  context.setFillStyle('#84919a')
  context.setFontSize(22)
  context.fillText('脚牛马人格认证 · 调试样张', 300, 756)

  context.draw(false, () => {
    uni.canvasToTempFilePath({
      canvasId,
      destWidth: 600,
      destHeight: 840,
      fileType: 'png',
      quality: 1,
      success: ({ tempFilePath }) => resolve(tempFilePath),
      fail: reject,
    })
  })
})

export const saveBadgeFile = async (tempFilePath: string, fileName: string) => {
  // #ifdef H5
  const link = document.createElement('a')
  link.href = tempFilePath
  link.download = `${fileName}.png`
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // #endif

  // #ifdef MP-WEIXIN
  await new Promise<void>((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => resolve(),
      fail: reject,
    })
  })
  // #endif
}
