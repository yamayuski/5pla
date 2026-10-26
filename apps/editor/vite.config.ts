import stylex from "@stylexjs/unplugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

// ゲーム本体 (apps/web) は 5173。エディタは別ポートで同時に起動できるようにする。
// NodeNext の型は名前空間、実行時の default は関数。
const stylexPlugin = typeof stylex === "function" ? stylex : stylex.default;

export default defineConfig({
  plugins: lazyPlugins(() => [stylexPlugin(), react()]),
  server: {
    host: true,
    port: 5174,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 5174,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ["@babylonjs/havok"],
  },
  assetsInclude: ["**/*.wasm"],
});
