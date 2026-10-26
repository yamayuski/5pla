import { defineConfig } from "vite-plus";

export default defineConfig({
  // shortcut: oxfmt wants to rewrite the horror kits that just landed on main, leave them until a format-only pass
  fmt: {
    ignorePatterns: ["packages/games/**", "docs/**"],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
