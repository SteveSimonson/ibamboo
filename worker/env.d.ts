/**
 * Minimal Env typing for the Worker.
 * Full runtime types: `npx wrangler types` → worker-configuration.d.ts
 */

interface EmailAddress {
  name?: string
  email: string
}

interface EmailMessageBuilder {
  to: string | EmailAddress | (string | EmailAddress)[]
  from: string | EmailAddress
  subject: string
  replyTo?: string | EmailAddress
  headers?: Record<string, string>
  text?: string
  html?: string
}

interface EmailSendResult {
  messageId?: string
  delivered?: string[]
  permanent_bounces?: string[]
  queued?: string[]
  [key: string]: unknown
}

interface SendEmail {
  send(builder: EmailMessageBuilder): Promise<EmailSendResult>
}

interface Env {
  ASSETS: Fetcher
  EMAIL: SendEmail
  EMAIL_FROM: string
  EMAIL_FROM_NAME: string
  EMAIL_REPLY_TO: string
  GHL_PIT?: string
  GHL_LOCATION_ID?: string
  /** Admin control plane (POC) */
  ADMIN_KV?: KVNamespace
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  FLASH_CATALOG_URL?: string
  LIBRARY_URL?: string
  LIBRARY_TOKEN?: string
}
