/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMAZON_ASSOCIATE_TAG?: string
  /** Flash Catalog Worker base URL (assortment SoT). Default baked in client. */
  readonly VITE_FLASH_CATALOG_URL?: string
  readonly VITE_CONBAL_ORIGIN?: string
  readonly VITE_CONBAL_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
