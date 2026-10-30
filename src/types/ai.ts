export type AiShoeStyleKey = 'involution' | 'showoff' | 'slacker' | 'love-feet'

export type ExistingResultKey = 'involution' | 'showoff' | 'steady' | 'love-feet'

export const RESULT_TO_AI_STYLE: Record<ExistingResultKey, AiShoeStyleKey> = {
  involution: 'involution',
  showoff: 'showoff',
  // 现有 Figma 结果页仍叫“安稳型”；AI 风格阶段按新决策映射为“摸鱼型”。
  steady: 'slacker',
  'love-feet': 'love-feet',
}

export interface GenerateShoeImageInput {
  styleKey: AiShoeStyleKey
  /** 必须是 AI 服务商能读取的 HTTPS 地址，建议来自 CloudBase 云存储或当前演示站。 */
  sourceImageUrl: string
  /** 可选颜色方向，例如“雾蓝 + 银灰点缀”。不得包含主要造型修改指令。 */
  colorDirection?: string
  /** 可选细节方向，例如“加强鞋面线性层次”。服务端仍会强制保留主要造型。 */
  detailDirection?: string
}

export interface GeneratedShoeImage {
  styleKey: AiShoeStyleKey
  imageBase64: string
  mimeType: 'image/webp'
  model: string
  promptVersion: string
  providerResponseId?: string
  requestId?: string
}

export interface GenerateShoeImageFunctionResult {
  ok: boolean
  data?: GeneratedShoeImage
  code?: string
  message?: string
}
