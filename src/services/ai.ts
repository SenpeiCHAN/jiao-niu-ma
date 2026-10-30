import cloudbase from '@cloudbase/js-sdk'
import type {
  GenerateShoeImageFunctionResult,
  GenerateShoeImageInput,
  GeneratedShoeImage,
} from '../types/ai'

let app: ReturnType<typeof cloudbase.init> | undefined
let authReady: Promise<void> | undefined

function getCloudBaseApp() {
  if (app) return app

  const env = import.meta.env.VITE_CLOUDBASE_ENV_ID?.trim()
  if (!env) {
    throw new Error('AI 服务尚未配置：缺少 VITE_CLOUDBASE_ENV_ID')
  }

  const accessKey = import.meta.env.VITE_CLOUDBASE_PUBLISHABLE_KEY?.trim()
  app = cloudbase.init({
    env,
    ...(accessKey ? { accessKey } : {}),
  })
  return app
}

async function ensureAnonymousSession() {
  if (!authReady) {
    authReady = (async () => {
      const cloudbaseApp = getCloudBaseApp()
      const { error } = await cloudbaseApp.auth.signInAnonymously()
      if (error) throw new Error(`CloudBase 匿名登录失败：${error.message}`)
    })().catch((error) => {
      authReady = undefined
      throw error
    })
  }
  return authReady
}

export async function generateStyledShoe(
  input: GenerateShoeImageInput,
): Promise<GeneratedShoeImage> {
  await ensureAnonymousSession()
  const cloudbaseApp = getCloudBaseApp()
  const functionName = import.meta.env.VITE_AI_FUNCTION_NAME?.trim() || 'generateShoeImage'

  const response = await cloudbaseApp.callFunction({
    name: functionName,
    data: input,
    parse: true,
  })

  const rawResult = response.result
  const result = (typeof rawResult === 'string'
    ? JSON.parse(rawResult)
    : rawResult) as GenerateShoeImageFunctionResult | undefined

  if (!result?.ok || !result.data) {
    throw new Error(result?.message || 'AI 风格化生图失败，请稍后重试')
  }

  return result.data
}

export function generatedShoeDataUrl(image: GeneratedShoeImage) {
  return `data:${image.mimeType};base64,${image.imageBase64}`
}
