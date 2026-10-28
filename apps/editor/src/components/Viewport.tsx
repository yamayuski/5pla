/**
 * Babylon のキャンバス。ブリッジの寿命はマウントに合わせる。
 */
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";
import { SceneBridge } from "../babylon/sceneBridge";
import { tokens } from "./tokens.stylex";

const styles = stylex.create({
  frame: {
    position: "relative",
    minWidth: "0",
    minHeight: "0",
    backgroundColor: tokens.bg,
  },
  canvas: {
    width: "100%",
    height: "100%",
    display: "block",
    touchAction: "none",
  },
});

export function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bridge = new SceneBridge(canvas);
    let stopped = false;
    void bridge.start().then(() => {
      if (stopped) bridge.dispose();
    });
    return () => {
      stopped = true;
      bridge.dispose();
    };
  }, []);
  return (
    <div {...stylex.props(styles.frame)}>
      <canvas ref={canvasRef} {...stylex.props(styles.canvas)} />
    </div>
  );
}
