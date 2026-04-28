"use client";
import { useState } from "react";
import { useTheme } from "@/app/lib/context";
import { store } from "@/app/lib/store";
import { Inp, Btn, Card } from "../ui";

export function FirstSetup({ onCreated, dark, toggleTheme }) {
  const { c } = useTheme();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  async function submit() {
    if (!f.name || !f.email || !f.password) { setErr("모든 항목을 입력해주세요"); return; }
    if (f.password !== f.confirm) { setErr("비밀번호가 일치하지 않아요"); return; }
    const admin = { id: String(Date.now()), name: f.name, email: f.email, password: f.password, grade: "관리자", isAdmin: true, tagOnly: false, createdAt: new Date().toISOString() };
    const team = [admin];
    await store.set("teams", team);
    onCreated(team, admin);
  }
  return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: c.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>RM</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.text }}>RM Agent</div>
            <div style={{ fontSize: 11, color: c.textSub }}>관리자 계정을 만들어 시작하세요</div>
          </div>
        </div>
        {err && <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(250,82,82,0.08)", color: "#FA5252", fontSize: 12, marginBottom: 14 }}>{err}</div>}
        <Card c={c}>
          <div style={{ display: "grid", gap: 14 }}>
            <Inp label="이름 *" value={f.name} onChange={v => setF(p => ({ ...p, name: v }))} c={c} />
            <Inp label="이메일 *" value={f.email} onChange={v => setF(p => ({ ...p, email: v }))} c={c} type="email" />
            <Inp label="비밀번호 *" value={f.password} onChange={v => setF(p => ({ ...p, password: v }))} c={c} type="password" />
            <Inp label="비밀번호 확인 *" value={f.confirm} onChange={v => setF(p => ({ ...p, confirm: v }))} c={c} type="password" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
              <button onClick={toggleTheme} style={{ padding: "7px 12px", borderRadius: 10, border: "1.5px solid " + c.inputBorder, background: "transparent", cursor: "pointer", fontSize: 12, color: c.textSub }}>{dark ? "☀️ 라이트" : "🌙 다크"}</button>
              <Btn onClick={submit} c={c} style={{ padding: "11px 36px", fontSize: 14 }}>시작하기</Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
