"use client";
import { useTheme } from "@/app/lib/context";
import { APP_VERSION } from "@/app/lib/constants";
import { todayInfo } from "@/app/lib/utils";

export function TopBar({ dark, toggleTheme, currentUser, onOpenCalc }) {
  const { c } = useTheme();
  const t = todayInfo();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 52, borderBottom: "1px solid " + c.divider, background: c.card, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 12, color: c.textSub }}>
          <span style={{ fontWeight: 700, color: c.text }}>{t.str}</span> ({t.korDay})
        </div>
        {currentUser && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 6, background: c.brandLight }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.brand }}>{currentUser.name}</span>
            {currentUser.isAdmin && <span style={{ fontSize: 10, color: c.brand, opacity: 0.65 }}>관리자</span>}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onOpenCalc} title="시급 계산기 (상담용 빠른 견적)" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1.5px solid " + c.brand + "66", background: c.brandLight, color: c.brand, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <span style={{ fontSize: 14 }}>🧮</span>
          <span>시급 계산기</span>
        </button>
        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: c.bg2, color: c.textSub, fontWeight: 600, letterSpacing: "0.03em" }}>{APP_VERSION}</span>
        <button onClick={toggleTheme} style={{ width: 34, height: 34, borderRadius: 6, border: "1px solid " + c.inputBorder, background: "transparent", cursor: "pointer", fontSize: 14 }}>{dark ? "☀️" : "🌙"}</button>
      </div>
    </div>
  );
}
