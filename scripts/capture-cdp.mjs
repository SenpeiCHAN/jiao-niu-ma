import { writeFile } from 'node:fs/promises'

const [webSocketUrl, outputPath, widthArgument = '430', heightArgument = '932'] = process.argv.slice(2)
const width = Number(widthArgument)
const height = Number(heightArgument)

if (!webSocketUrl || !outputPath || !Number.isFinite(width) || !Number.isFinite(height)) {
  throw new Error('Usage: node scripts/capture-cdp.mjs <webSocketUrl> <outputPath> [width] [height]')
}

const socket = new WebSocket(webSocketUrl)
const pending = new Map()
let sequence = 0

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence
  pending.set(id, { resolve, reject })
  socket.send(JSON.stringify({ id, method, params }))
})

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  if (message.error) request.reject(new Error(message.error.message))
  else request.resolve(message.result)
})

try {
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await new Promise((resolve) => setTimeout(resolve, 250))
  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true,
  })
  await writeFile(outputPath, screenshot.data, 'base64')
} finally {
  socket.close()
}
