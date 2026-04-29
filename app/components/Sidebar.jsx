"use client";
import { useTheme } from "@/app/lib/context";
import { roleGroupOfLegacy } from "@/app/lib/utils";
import { IC } from "./ui";

// GRIDGE spec: 160px 고정, 아이콘(18px) + 메뉴명(13px), 활성: borderLeft 3px
const NAV = [
  { id: "dashboard",  label: "홈",        icon: IC.dashboard  },
  { id: "customers",  label: "고객관리",   icon: IC.customers  },
  { id: "consulting", label: "상담관리",   icon: IC.consulting },
  { id: "contract",   label: "계약관리",   icon: IC.contract   },
  { id: "workers",    label: "작업자",     icon: IC.workers    },
  { id: "settings",   label: "설정",       icon: IC.settings   },
];

export function Sidebar({ page, setPage, onLogout, currentUser, perms, dark, toggleTheme }) {
  const { c } = useTheme();
  const roleGroup = roleGroupOfLegacy(currentUser);
  const visibleNav = NAV.filter(n => {
    if (["dashboard", "settings", "workers"].includes(n.id)) return true;
    const p = perms[n.id]; return !p || p[roleGroup] !== false;
  });
  return (
    <div style={{
      width: 160, minHeight: "100vh", background: c.card,
      borderRight: "1px solid " + c.cardBorder,
      padding: "16px 10px", display: "flex", flexDirection: "column",
      flexShrink: 0, transition: "background .15s, border-color .15s",
    }}>
      {/* 로고 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 16px", borderBottom: "1px solid " + c.divider, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: c.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: c.card }}>RM</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>GRIDGE</div>
          <div style={{ fontSize: 10, color: c.textSub }}>CRM</div>
        </div>
      </div>

      {/* 내비게이션 */}
      {visibleNav.map(n => {
        const active = page === n.id;
        return (
          <div key={n.id} onClick={() => setPage(n.id)}
            style={{
              padding: "10px 10px", borderRadius: 8, fontSize: 13, cursor: "pointer",
              marginBottom: 2, display: "flex", alignItems: "center", gap: 10,
              position: "relative",
              background: active ? c.brandLight : "transparent",
              color: active ? c.brand : c.text, fontWeight: active ? 600 : 500,
              borderLeft: active ? "3px solid " + c.brand : "3px solid transparent",
              transition: "background .15s, color .15s",
            }}>
            <span style={{ display: "flex", alignItems: "center", color: active ? c.brand : c.textSub, flexShrink: 0 }}>{n.icon}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.label}</span>
          </div>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* 테마 토글 */}
      <button onClick={toggleTheme}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid " + c.inputBorder, background: "transparent", cursor: "pointer", color: c.textSub, fontSize: 12, marginBottom: 4, transition: "background .15s" }}>
        <span style={{ fontSize: 14 }}>{dark ? "☀️" : "🌙"}</span>
        <span>{dark ? "라이트 모드" : "다크 모드"}</span>
      </button>

      {/* 로그아웃 */}
      <div onClick={onLogout}
        style={{ padding: "9px 10px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: c.textSub, fontSize: 13, transition: "background .15s" }}>
        <span style={{ display: "flex", alignItems: "center" }}>{IC.logout}</span>
        <span>로그아웃</span>
      </div>
    </div>
  );
}
