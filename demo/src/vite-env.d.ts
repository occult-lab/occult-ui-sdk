/// <reference types="vite/client" />

// Pulls in two things this demo depends on: `declare module '*.css' {}`,
// without which `import "occult-api-ui/styles.css"` is TS2882 ("cannot find
// module or type declarations for side-effect import"), and the ImportMeta
// augmentation that types `import.meta.env`. Apps built with Next get the
// same CSS declaration from next/types, which is why only this demo needed it.

interface ImportMetaEnv {
  readonly VITE_OCCULT_API_KEY?: string;
  readonly VITE_OCCULT_BASE_URL?: string;
}
