export async function saveResultImage(imagePath: string, fileName: string) {
  // #ifdef H5
  const link = document.createElement('a')
  link.href = imagePath
  link.download = `${fileName}.png`
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  return
  // #endif

  // #ifdef MP-WEIXIN
  const image = await new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
    uni.getImageInfo({ src: imagePath, success: resolve, fail: reject })
  })
  await new Promise<void>((resolve, reject) => {
    uni.saveImageToPhotosAlbum({ filePath: image.path, success: () => resolve(), fail: reject })
  })
  // #endif
}
