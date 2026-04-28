"use client";
import { useTheme } from "@/app/lib/context";
import { roleGroupOf } from "@/app/lib/utils";
import { IC } from "./ui";

const NAV = [
  { id: "dashboard", label: "대시보드", icon: IC.dashboard },
  { id: "customers", label: "고객관리", icon: IC.customers },
  { id: "consulting", label: "상담관리", icon: IC.consulting },
  { id: "contract", label: "계약관리", icon: IC.contract },
  { id: "workers", label: "작업자관리", icon: IC.workers },
  { id: "settings", label: "설정", icon: IC.settings },
];

export function Sidebar({ page, setPage, onLogout, collapsed, setCollapsed, currentUser, perms }) {
  const { c } = useTheme();
  const roleGroup = roleGroupOf(currentUser);
  const visibleNav = NAV.filter(n => {
    if (["dashboard", "settings", "workers"].includes(n.id)) return true;
    const p = perms[n.id]; return !p || p[roleGroup] !== false;
  });
  return (
    <div style={{ width: collapsed ? 72 : 244, minHeight: "100vh", background: c.card, borderRight: "1px solid " + c.cardBorder, padding: "18px 12px", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width .2s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", padding: "0 6px 20px", borderBottom: "1px solid " + c.divider, marginBottom: 12, gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: c.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>RM</span>
        </div>
        {!collapsed && <div><div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>RM Agent</div><div style={{ fontSize: 11, color: c.textSub }}>CRM Platform</div></div>}
      </div>
      {visibleNav.map(n => {
        const active = page === n.id;
        return (
          <div key={n.id} onClick={() => setPage(n.id)} title={collapsed ? n.label : undefined}
            style={{ padding: collapsed ? "12px 0" : "11px 14px", borderRadius: 8, fontSize: 14, cursor: "pointer", marginBottom: 3, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 12, position: "relative", background: active ? c.brandLight : "transparent", color: active ? c.brand : c.text, fontWeight: active ? 600 : 500 }}>
            {active && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", background: c.brand }} />}
            <span style={{ display: "flex", alignItems: "center", color: active ? c.brand : c.textSub }}>{n.icon}</span>
            {!collapsed && <span>{n.label}</span>}
          </div>
        );
      })}
      <div style={{ flex: 1 }} />
      <button onClick={() => setCollapsed(p => !p)} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, padding: "8px 14px", borderRadius: 6, background: c.brandLight, border: "none", cursor: "pointer", color: c.brand, fontSize: 12, marginBottom: 6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d={collapsed ? "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" : "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"} />
        </svg>
        {!collapsed && <span>접기</span>}
      </button>
      <div onClick={onLogout} style={{ padding: collapsed ? "12px 0" : "11px 14px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 12, color: c.textSub, fontSize: 14 }}>
        <span style={{ display: "flex", alignItems: "center" }}>{IC.logout}</span>
        {!collapsed && <span>로그아웃</span>}
      </div>
    </div>
  );
}
