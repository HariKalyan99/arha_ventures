/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional URL that accepts POSTed JSON enquiries (e.g. Formspree, a serverless function, or a CRM webhook). */
  readonly VITE_INQUIRY_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
