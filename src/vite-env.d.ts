/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Enquiry POST URL. Defaults to /api/inquiry when unset. */
  readonly VITE_INQUIRY_ENDPOINT?: string
  /** Lead magnet POST URL. Defaults to /api/lead-magnet when unset. */
  readonly VITE_LEAD_MAGNET_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
