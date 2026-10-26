/**
 * ビューポート、階層、インスペクタを並べる。
 */
import * as stylex from "@stylexjs/stylex";
import { Inspector } from "./components/Inspector";
import { Outliner } from "./components/Outliner";
import { Toolbar } from "./components/Toolbar";
import { Viewport } from "./components/Viewport";
import { tokens } from "./components/tokens.stylex";

const styles = stylex.create({
  app: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    height: "100%",
    backgroundColor: tokens.bg,
    color: tokens.text,
    fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", "Hiragino Sans", sans-serif',
    fontSize: "13px",
  },
  body: {
    display: "grid",
    gridTemplateColumns: "240px minmax(0, 1fr) 320px",
    minHeight: "0",
  },
});

export function App() {
  return (
    <div {...stylex.props(styles.app)}>
      <Toolbar />
      <div {...stylex.props(styles.body)}>
        <Outliner />
        <Viewport />
        <Inspector />
      </div>
    </div>
  );
}
