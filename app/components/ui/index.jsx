"use client";
import { useState } from "react";
import { useTheme } from "@/app/lib/context";
import { STATUS_MAP } from "@/app/lib/constants";

// DS-COMP-001 핵심 컴포넌트
export function Badge({ status }) {
  const { c } = useTheme();
  const sm = STATUS_MAP[status] || { key: "sNew" };
  const st = c[sm.key] || c.sNew;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: c.bg2, color: c.text }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot }} />
      {status}
    </span>
  );
}

export function Card({ children, c, style, onClick }) {
  const base = { background: c.card, border: "1px solid " + c.cardBorder, borderRadius: 12, padding: "20px 24px", boxShadow: c.cardShadow, cursor: onClick ? "pointer" : "default" };
  return <div onClick={onClick} style={{ ...base, ...(style || {}) }}>{children}</div>;
}

export function Inp({ label, placeholder, value, onChange, c, type, required }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      {label && <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 600 }}>{label}{required && <span style={{ color: "#FA5252", marginLeft: 2 }}>*</span>}</div>}
      <input
        type={type || "text"}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ""}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid " + (focus ? c.brand : c.inputBorder), background: c.inputBg, fontSize: 13, color: c.text, outline: "none", boxShadow: focus ? "0 0 0 3px " + c.brand + "1A" : "none" }}
      />
    </div>
  );
}

export function Btn({ children, onClick, variant, c, style, disabled }) {
  const v = variant || "primary";
  let bs = {};
  if (v === "primary") bs = { background: c.brand, color: "#fff", border: "none", boxShadow: "0 2px 8px " + c.brand + "40" };
  else if (v === "secondary") bs = { background: c.brandLight, color: c.brand, border: "1.5px solid " + c.brand + "44" };
  else if (v === "ghost") bs = { background: "transparent", color: c.textSub, border: "1.5px solid " + c.inputBorder };
  else if (v === "danger") bs = { background: "#FFF1F2", color: "#FA5252", border: "1.5px solid rgba(250,82,82,0.3)" };
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...bs, ...(style || {}) }}>
      {children}
    </button>
  );
}

export function Toggle({ on, onChange, c }) {
  return (
    <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: on ? c.brand : c.inputBorder, cursor: "pointer", display: "flex", alignItems: "center", padding: "0 3px", justifyContent: on ? "flex-end" : "flex-start", transition: "background .2s" }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.25)" }} />
    </div>
  );
}

export function Loading() {
  const { c } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10, color: c.textSub, fontSize: 13 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid " + c.brand, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      불러오는 중...
    </div>
  );
}

export function BackBtn({ onClick, label }) {
  const { c } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18, padding: "7px 14px", background: hover ? c.brandLight : c.card, border: "1px solid " + (hover ? c.brand : c.inputBorder), borderRadius: 8, cursor: "pointer", fontSize: 13, color: hover ? c.brand : c.text, fontWeight: 600 }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
      {label || "목록으로"}
    </button>
  );
}

export function ChipBtn({ active, onClick, label, c }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid " + (active ? c.brand : c.inputBorder), background: active ? c.brandLight : "transparent", color: active ? c.brand : c.textSub, fontWeight: active ? 600 : 400 }}>
      {label}
    </button>
  );
}

// 사이드바 / 액션 / 화살표 등 인라인 SVG 모음 (DS-ICON-001)
export const IC = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>,
  customers: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
  consulting: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>,
  contract: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" /></svg>,
  workers: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>,
};
