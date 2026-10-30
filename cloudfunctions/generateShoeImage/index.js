'use strict'

const crypto = require('crypto')
const https = require('https')
const { PROMPT_VERSION, STYLE_LIBRARY, buildStylePrompt } = require('./prompt-library')

const DEFAULT_MODEL = 'gpt-image-2.5-sunburst'
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/images/edits'

function requestJson(url, options, payload) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, options, (response) => {
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        let body
        try {
          body = raw ? JSON.parse(raw) : {}
        } catch {
          body = { error: { message: 'OpenAI returned a non-JSON response' } }
        }
        resolve({ statusCode: response.statusCode || 500, body })
      })
    })
    request.setTimeout(120000, () => request.destroy(new Error('OPENAI_TIMEOUT')))
    request.on('error', reject)
    request.write(payload)
    request.end()
  })
}

function normalizeEvent(event) {
  if (!event || typeof event !== 'object') return {}
  if (typeof event.body === 'string') {
    try { return JSON.parse(event.body) } catch { return {} }
  }
  return event.body && typeof event.body === 'object' ? event.body : event
}

function validateInput(input) {
  if (!STYLE_LIBRARY[input.styleKey]) throw new Error('UNSUPPORTED_STYLE')
  if (typeof input.sourceImageUrl !== 'string' || input.sourceImageUrl.length > 4096) {
    throw new Error('INVALID_SOURCE_IMAGE_URL')
  }
  let parsed
  try { parsed = new URL(input.sourceImageUrl) } catch { throw new Error('INVALID_SOURCE_IMAGE_URL') }
  if (parsed.protocol !== 'https:') throw new Error('SOURCE_IMAGE_MUST_USE_HTTPS')
}

function safetyIdentifier(event, context) {
  const identity = event?.userInfo?.openId
    || event?.userInfo?.uid
    || event?.userContext?.uid
    || context?.request_id
    || 'anonymous'
  return crypto.createHash('sha256').update(String(identity)).digest('hex').slice(0, 64)
}

function fail(code, message) {
  return { ok: false, code, message }
}

exports.main = async (event, context) => {
  if (process.env.AI_GENERATION_ENABLED !== 'true') {
    return fail('AI_GENERATION_DISABLED', 'AI 生图服务尚未开放')
  }
  if (!process.env.OPENAI_API_KEY) {
    return fail('OPENAI_API_KEY_MISSING', 'AI 服务端密钥尚未配置')
  }

  const input = normalizeEvent(event)
  try {
    validateInput(input)
  } catch (error) {
    return fail(error.message, '生图参数不符合要求')
  }

  const prompt = buildStylePrompt(input)
  const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL
  const requestBody = JSON.stringify({
    model,
    images: [{ image_url: input.sourceImageUrl }],
    prompt,
    size: '1024x1024',
    quality: 'high',
    background: 'transparent',
    output_format: 'webp',
    output_compression: 88,
    n: 1,
    moderation: 'auto',
    safety_identifier: safetyIdentifier(event, context),
  })

  let upstream
  try {
    upstream = await requestJson(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    }, requestBody)
  } catch (error) {
    console.error('OpenAI image request failed', error.message)
    return fail('OPENAI_REQUEST_FAILED', '图像服务暂时不可用，请稍后重试')
  }

  if (upstream.statusCode < 200 || upstream.statusCode >= 300) {
    console.error('OpenAI image request rejected', upstream.statusCode, upstream.body?.error?.code)
    return fail('OPENAI_REQUEST_REJECTED', '图像服务未能完成本次请求')
  }

  const image = upstream.body?.data?.[0]
  if (!image?.b64_json) {
    return fail('OPENAI_IMAGE_EMPTY', '图像服务没有返回有效图片')
  }

  return {
    ok: true,
    data: {
      styleKey: input.styleKey,
      imageBase64: image.b64_json,
      mimeType: 'image/webp',
      model,
      promptVersion: PROMPT_VERSION,
      requestId: context?.request_id,
    },
  }
}
