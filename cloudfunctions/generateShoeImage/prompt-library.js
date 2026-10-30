'use strict'

const PROMPT_VERSION = 'shoe-style-v1.0.0'

const BASE_PRESERVATION = [
  'Edit the supplied shoe image; do not redesign it from scratch.',
  'Preserve the primary silhouette, toe profile, heel profile, collar opening, sole footprint, upper-to-sole proportion, camera angle, and recognizable construction identity of the source shoe.',
  'Keep the result as one complete, physically plausible wearable shoe. Only secondary surface details, material articulation, small structural accents, and color may change.',
].join(' ')

const BASE_NEGATIVE = [
  'Do not replace the source with a different shoe category or a generic sneaker.',
  'No changed camera viewpoint, cropped toe or heel, duplicated shoe, pair of shoes, human foot, person, floating components, melted geometry, broken outsole, extra sole, extra laces, impossible openings, or disconnected panels.',
  'No brand logo, trademark, readable text, watermark, label, price tag, UI, poster layout, scenery, or decorative background.',
  'Do not let styling erase the source shoe’s defining silhouette or functional construction.',
].join(' ')

const STYLE_LIBRARY = Object.freeze({
  involution: {
    label: '内卷线牛马',
    signature: [
      'A disciplined, high-intensity performance language built from dense continuous linear ribs.',
      'Use topology-driven filament bands, tightly controlled diagonal lattices, layered tension lines, precise engineered rhythm, and a forward-driving sense of speed.',
      'The detail density may be high, but every line must follow the source shoe anatomy and remain manufacturable.',
    ].join(' '),
    palette: 'Prefer cool technical palettes such as ice blue, cobalt, silver, graphite, or clean white, while allowing the requested color direction.',
    negative: 'Avoid lazy rounded padding, loose casual forms, sparse lattice, cute decoration, soft slipper language, chaotic scribbles, and random line noise.',
    referenceFeatures: ['连续线性骨架', '高密度斜向编织', '速度感', '精密工程秩序', '紧张且向前的视觉动势'],
  },
  showoff: {
    label: '显眼包牛马',
    signature: [
      'An expressive, theatrical, fashion-forward performance language with unmistakable visual presence.',
      'Use bold aerodynamic waves, sculptural fins, flowing shell-like overlays, dramatic but coherent curvature, and one or two memorable focal gestures.',
      'Details may become more exaggerated than the source, but the source silhouette and sole architecture must remain clearly recognizable.',
    ].join(' '),
    palette: 'Allow bold contrast, luminous accents, saturated gradients, pearl, chrome, or high-visibility color blocking while keeping the requested palette coherent.',
    negative: 'Avoid plain minimal basics, timid monochrome treatment, conservative paneling, generic mass-market sneaker styling, cluttered decoration, and multiple competing focal points.',
    referenceFeatures: ['夸张流线壳体', '强焦点造型', '高辨识度', '戏剧性曲面', '张扬但完整的运动感'],
  },
  slacker: {
    label: '摸鱼型牛马',
    signature: [
      'A relaxed, cushioned, low-pressure comfort language that looks easy to wear for long periods.',
      'Use breathable knit or mesh, soft rounded transitions, a stable broad footprint, generous cushioning, gentle wave details, and calm visual pacing.',
      'The styling should communicate comfort and effortlessness without turning the shoe into a shapeless blob.',
    ].join(' '),
    palette: 'Prefer calm low-saturation palettes such as warm white, mist green, oatmeal, soft gray, or muted blue, while allowing the requested color direction.',
    negative: 'Avoid aggressive racing spikes, rigid armor, sharp pressure points, extreme heel lift, tense high-density graphics, fragile thin soles, and loud competitive styling.',
    referenceFeatures: ['厚实缓震', '柔和圆润', '宽稳落地感', '透气舒适', '松弛低压的节奏'],
  },
  'love-feet': {
    label: '爱你老脚型牛马',
    signature: [
      'A foot-first ergonomic comfort language centered on adaptive fit and gentle support.',
      'Use a seamless laceless upper, organic diamond or cellular lattice, roomy toe volume, soft adaptive containment, breathable openness, and smooth pressure-free transitions.',
      'The lattice must wrap the source anatomy consistently and look structurally intentional rather than like random netting.',
    ].join(' '),
    palette: 'Prefer warm skin-friendly neutrals, soft pink, cream, pale lavender, sand, or clean white, while allowing the requested color direction.',
    negative: 'Avoid narrow pointed toes, tight rigid collars, conventional laces, hard angular cages, abrasive edges, unstable high heels, random torn mesh, and medically clinical styling.',
    referenceFeatures: ['无鞋带包裹', '有机网格', '宽容脚型', '呼吸感', '温和贴足与低压支撑'],
  },
})

function cleanOptionalText(value, maxLength = 160) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function buildStylePrompt({ styleKey, colorDirection, detailDirection }) {
  const style = STYLE_LIBRARY[styleKey]
  if (!style) throw new Error('UNSUPPORTED_STYLE')

  const safeColor = cleanOptionalText(colorDirection)
  const safeDetail = cleanOptionalText(detailDirection)
  const optionalDirection = [
    safeColor ? `Requested color direction: ${safeColor}.` : '',
    safeDetail ? `Requested secondary-detail direction: ${safeDetail}. Apply it only when it does not conflict with the preservation constraints.` : '',
  ].filter(Boolean).join(' ')

  return [
    `STYLE EDIT — ${style.label}.`,
    BASE_PRESERVATION,
    `Style signature: ${style.signature}`,
    style.palette,
    optionalDirection,
    `Must avoid: ${BASE_NEGATIVE} ${style.negative}`,
    'Output one centered full side-profile product cutout, fully visible from toe to heel, with clean edges, physically credible materials, controlled studio lighting, and a transparent background.',
    'Final check: the source shoe must remain immediately recognizable by its main silhouette and proportions; changes are limited to style-consistent details and color.',
  ].filter(Boolean).join('\n\n')
}

module.exports = {
  PROMPT_VERSION,
  STYLE_LIBRARY,
  buildStylePrompt,
}
