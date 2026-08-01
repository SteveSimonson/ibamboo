/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMAZON_ASSOCIATE_TAG?: string
  readonly VITE_CONBAL_ORIGIN?: string
  readonly VITE_CONBAL_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
