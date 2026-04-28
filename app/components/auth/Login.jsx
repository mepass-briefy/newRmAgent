"use client";
import { useState } from "react";
import { useTheme } from "@/app/lib/context";
import { Inp, Card } from "../ui";

export function Login({ team, onLogin, dark, toggleTheme }) {
  const { c } = useTheme();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  function submit() {
    const user = team.find(t => !t.tagOnly && t.password && (t.email === id || t.name === id) && t.password === pw);
    if (!user) { setErr("이메일/이름 또는 비밀번호가 올바르지 않아요"); return; }
    onLogin(user);
  }
  return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: c.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 auto 16px" }}>RM</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: c.text }}>RM Agent</div>
          <div style={{ fontSize: 13, color: c.textSub, marginTop: 6 }}>IT 리소스 매칭 CRM</div>
        </div>
        {err && <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(250,82,82,0.08)", color: "#FA5252", fontSize: 12, marginBottom: 14, textAlign: "center" }}>{err}</div>}
        <Card c={c} style={{ padding: "28px 24px" }}>
          <div style={{ display: "grid", gap: 14, marginBottom: 14 }}>
            <Inp label="이메일 또는 이름" value={id} onChange={setId} c={c} placeholder="email@company.com" />
            <Inp label="비밀번호" value={pw} onChange={setPw} c={c} type="password" placeholder="Password" />
          </div>
          <button onClick={submit} onKeyDown={e => { if (e.key === "Enter") submit(); }} style={{ width: "100%", padding: 13, borderRadius: 8, background: c.brand, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px " + c.brand + "38" }}>Sign in →</button>
        </Card>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <button onClick={toggleTheme} style={{ padding: "6px 14px", borderRadius: 10, border: "1.5px solid " + c.inputBorder, background: "transparent", cursor: "pointer", fontSize: 12, color: c.textSub }}>{dark ? "☀️ 라이트" : "🌙 다크"}</button>
        </div>
      </div>
    </div>
  );
}
