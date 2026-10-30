/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDBASE_ENV_ID?: string
  readonly VITE_CLOUDBASE_PUBLISHABLE_KEY?: string
  readonly VITE_AI_FUNCTION_NAME?: string
  readonly VITE_AI_SOURCE_INVOLUTION_URL?: string
  readonly VITE_AI_SOURCE_SHOWOFF_URL?: string
  readonly VITE_AI_SOURCE_SLACKER_URL?: string
  readonly VITE_AI_SOURCE_LOVE_FEET_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
