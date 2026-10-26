/**
 * エディタの共通スタイルとフォーム部品。色は StyleX の変数に置く。
 */
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState, type ReactNode } from "react";
import type { Vec3 } from "../store/types";
import { tokens } from "./tokens.stylex";

const styles = stylex.create({
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingBottom: "12px",
    marginBottom: "12px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.line,
  },
  heading: {
    margin: "0",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: tokens.muted,
  },
  field: {
    display: "grid",
    gridTemplateColumns: "88px 1fr",
    gap: "6px",
    alignItems: "center",
  },
  label: {
    color: tokens.muted,
    fontSize: "12px",
  },
  control: {
    width: "100%",
    backgroundColor: tokens.panel2,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: tokens.line,
    borderRadius: "4px",
    padding: "4px 6px",
    minWidth: "0",
  },
  row: {
    display: "flex",
    gap: "6px",
  },
  button: {
    backgroundColor: tokens.panel2,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: tokens.line,
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
  },
  buttonActive: {
    backgroundColor: tokens.accent,
    color: tokens.accentText,
    borderColor: tokens.accent,
  },
  buttonDanger: {
    color: tokens.danger,
  },
});

export function Section(props: { title: string; children: ReactNode }) {
  return (
    <section {...stylex.props(styles.section)}>
      <h2 {...stylex.props(styles.heading)}>{props.title}</h2>
      {props.children}
    </section>
  );
}

export function Field(props: { label: string; children: ReactNode }) {
  return (
    <label {...stylex.props(styles.field)}>
      <span {...stylex.props(styles.label)}>{props.label}</span>
      {props.children}
    </label>
  );
}

export function TextInput(props: { value: string; onCommit: (value: string) => void }) {
  const [text, setText] = useState(props.value);
  useEffect(() => {
    setText(props.value);
  }, [props.value]);
  return (
    <input
      {...stylex.props(styles.control)}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        if (text !== props.value) props.onCommit(text);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
    />
  );
}

export function NumberInput(props: {
  value: number;
  step?: number;
  onChange: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const [text, setText] = useState(formatNumber(props.value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(formatNumber(props.value));
  }, [props.value, focused]);
  return (
    <input
      {...stylex.props(styles.control)}
      type="number"
      step={props.step ?? 0.1}
      value={text}
      onFocus={() => {
        setFocused(true);
        props.onFocus?.();
      }}
      onChange={(event) => {
        setText(event.target.value);
        const next = Number(event.target.value);
        if (Number.isFinite(next) && next !== props.value) props.onChange(next);
      }}
      onBlur={() => {
        setFocused(false);
        props.onBlur?.();
      }}
    />
  );
}

export function Vec3Input(props: {
  value: Vec3;
  step?: number;
  onChange: (value: Vec3) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const axes = ["X", "Y", "Z"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {axes.map((axis, index) => (
        <NumberInput
          key={axis}
          value={props.value[index] ?? 0}
          step={props.step}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onChange={(next) => {
            const copy: Vec3 = [props.value[0], props.value[1], props.value[2]];
            copy[index] = next;
            props.onChange(copy);
          }}
        />
      ))}
    </div>
  );
}

export function ColorInput(props: {
  value: Vec3;
  onChange: (value: Vec3) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <input
      {...stylex.props(styles.control)}
      type="color"
      value={rgbToHex(props.value)}
      onFocus={props.onFocus}
      onChange={(event) => props.onChange(hexToRgb(event.target.value))}
      onBlur={props.onBlur}
    />
  );
}

export function SelectInput(props: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      {...stylex.props(styles.control)}
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
    >
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function CheckInput(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label {...stylex.props(styles.field)}>
      <span {...stylex.props(styles.label)}>{props.label}</span>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(event) => props.onChange(event.target.checked)}
      />
    </label>
  );
}

export function Button(props: {
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={props.title}
      disabled={props.disabled}
      {...stylex.props(
        styles.button,
        props.active && styles.buttonActive,
        props.danger && styles.buttonDanger,
      )}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
}

export function controlStyle() {
  return styles.control;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 10000) / 10000;
  return String(rounded);
}

export function rgbToHex(value: Vec3): string {
  const channel = (channelValue: number) => {
    const byte = Math.max(0, Math.min(255, Math.round(channelValue * 255)));
    return byte.toString(16).padStart(2, "0");
  };
  return `#${channel(value[0])}${channel(value[1])}${channel(value[2])}`;
}

export function hexToRgb(hex: string): Vec3 {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!match?.[1]) return [1, 1, 1];
  const digits = match[1];
  const read = (offset: number) => Number.parseInt(digits.slice(offset, offset + 2), 16) / 255;
  return [read(0), read(2), read(4)];
}
