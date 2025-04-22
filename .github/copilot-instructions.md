* すべてのソースコードは日本人により開発され、日本語でコメントされます
* すべてのソースコードは TypeScript の最新バージョンを使用します
* すべてのソースコードは turborepo により monorepo 管理されます
* すべてのソースコードは biome により format/lint されます
* 依存パッケージは pnpm workspaces により管理されます
* 基本的な書式は Editorconfig が適用されます
* #file:./apps/web/src/main.ts はランタイムであり、ロジックが入ることは推奨されません
* #file:./packages/games/src 以下にロジックが記述されます
* ロジックはシーンごとに分離されます
* レンダリングエンジンは Babylon.js 8 が用いられます
* クライアントサイドは GitHub Pages にデプロイされますが、サーバサイドロジックは必要に応じて Cloudflare にデプロイされます
* すべての import 文は tree-shaking を必須とします
