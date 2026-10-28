# 5pla - 5 minutes mini-game place

https://cafe-capy.net/5pla/

## Debug

Node.js 24。ワークスペースの dev / build / test / lint は Vite+ (`vp`)。

```sh
pnpm i
vp -C apps/web dev
```

See http://localhost:5173/5pla

## Scene editor / シーンエディタ

Babylon.js の配置用エディタです。`apps/editor` を起動し、http://localhost:5174 を開きます。使い方と書き出した `.glb` の読み方は [apps/editor/README.md](apps/editor/README.md)（日本語 / English）。

```sh
vp -C apps/editor dev
vp -C apps/editor test
```
