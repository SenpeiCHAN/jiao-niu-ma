'use strict'

const crypto = require('crypto')
const https = require('https')
const { PROMPT_VERSION, STYLE_LIBRARY, buildStylePrompt } = require('./prompt-library')

const DEFAULT_API_BASE_URL = 'https://lucen.plus/v1'
const DEFAULT_MAIN_MODEL = 'gpt-5.5'
const DEFAULT_IMAGE_MODEL = 'gpt-image-2.5-sunburst'

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
          body = { error: { message: 'AI provider returned a non-JSON response' } }
        }
        resolve({ statusCode: response.statusCode || 500, body })
      })
    })
    request.setTimeout(110000, () => request.destroy(new Error('AI_PROVIDER_TIMEOUT')))
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

function responsesEndpoint() {
  const explicitEndpoint = process.env.AI_RESPONSES_ENDPOINT?.trim()
  if (explicitEndpoint) return new URL(explicitEndpoint)

  const baseUrl = (process.env.AI_API_BASE_URL || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, '')
  return new URL(`${baseUrl}/responses`)
}

exports.main = async (event, context) => {
  if (process.env.AI_GENERATION_ENABLED !== 'true') {
    return fail('AI_GENERATION_DISABLED', 'AI 生图服务尚未开放')
  }
  const providerKey = process.env.LUCEN_API_KEY || process.env.OPENAI_API_KEY
  if (!providerKey) {
    return fail('AI_API_KEY_MISSING', 'AI 服务端密钥尚未配置')
  }

  const input = normalizeEvent(event)
  try {
    validateInput(input)
  } catch (error) {
    return fail(error.message, '生图参数不符合要求')
  }

  const mainModel = process.env.AI_MAIN_MODEL || DEFAULT_MAIN_MODEL
  const imageModel = process.env.AI_IMAGE_MODEL || process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL
  let endpoint
  try {
    endpoint = responsesEndpoint()
    if (endpoint.protocol !== 'https:') throw new Error('HTTPS_REQUIRED')
  } catch {
    return fail('AI_ENDPOINT_INVALID', '图像服务地址配置无效')
  }

  const requestBody = JSON.stringify({
    model: mainModel,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: buildStylePrompt(input) },
          { type: 'input_image', image_url: input.sourceImageUrl, detail: 'auto' },
        ],
      },
    ],
    tools: [
      {
        type: 'image_generation',
        model: imageModel,
        action: 'edit',
        size: '1024x1024',
        quality: 'high',
        background: 'transparent',
        output_format: 'webp',
        output_compression: 88,
      },
    ],
    tool_choice: { type: 'image_generation' },
    store: false,
    safety_identifier: safetyIdentifier(event, context),
  })

  let upstream
  try {
    upstream = await requestJson(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${providerKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    }, requestBody)
  } catch (error) {
    console.error('AI provider request failed', error.message)
    return fail('AI_REQUEST_FAILED', '图像服务暂时不可用，请稍后重试')
  }

  if (upstream.statusCode < 200 || upstream.statusCode >= 300) {
    const upstreamMessage = typeof upstream.body?.error?.message === 'string'
      ? upstream.body.error.message.slice(0, 240)
      : ''
    console.error(
      'AI provider request rejected',
      upstream.statusCode,
      upstream.body?.error?.code,
      upstream.body?.error?.type,
      upstreamMessage,
    )
    return fail('AI_REQUEST_REJECTED', '图像服务未能完成本次请求')
  }

  const imageCall = upstream.body?.output?.find(
    (item) => item?.type === 'image_generation_call' && typeof item.result === 'string',
  )
  if (!imageCall?.result) {
    console.error('AI provider response contained no image', upstream.body?.id, upstream.body?.status)
    return fail('AI_IMAGE_EMPTY', '图像服务没有返回有效图片')
  }

  return {
    ok: true,
    data: {
      styleKey: input.styleKey,
      imageBase64: imageCall.result,
      mimeType: 'image/webp',
      model: imageModel,
      promptVersion: PROMPT_VERSION,
      providerResponseId: upstream.body?.id,
      requestId: context?.request_id,
    },
  }
}
