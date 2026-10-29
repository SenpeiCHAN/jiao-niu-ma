const [webSocketUrl, expression] = process.argv.slice(2)

if (!webSocketUrl || !expression) {
  throw new Error('Usage: node scripts/evaluate-cdp.mjs <webSocketUrl> <expression>')
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
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  console.log(JSON.stringify(result.result.value ?? result.result.description))
} finally {
  socket.close()
}
