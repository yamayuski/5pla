/// <reference types="vite/client" />

declare module "virtual:stylex:runtime" {}

declare module "*.wasm?url" {
  const src: string;
  export default src;
}
