"use client";
import { useState } from "react";
import { useTheme, useRates, useCategories } from "@/app/lib/context";
import { Btn } from "./ui";

// REQ-CALC-001 시급 계산기 — 휘발성, 저장 안됨
export function RateCalculator({ open, onClose }) {
  const { c } = useTheme();
  const { rates } = useRates();
  const [members, setMembers] = useState([]);
  const [months, setMonths] = useState(3);
  const [copied, setCopied] = useState(false);

  function addMember() {
    const newM = {
      id: "calc_" + Math.random().toString(36).slice(2, 8),
      role_key: "", role_custom: "", grade: "",
      weekly_hours: 40, rate: 0, category: "other",
    };
    setMembers(p => p.concat([newM]));
  }
  function updMember(mi, k, v) {
    setMembers(p => { const m = p.slice(); m[mi] = { ...m[mi], [k]: v }; return m; });
  }
  function changeRole(mi, roleKey) {
    setMembers(p => {
      const m = p.slice(); const cur = m[mi];
      if (roleKey === "__custom") m[mi] = { ...cur, role_key: "__custom", role_custom: cur.role_custom || "" };
      else if (roleKey === "") m[mi] = { ...cur, role_key: "", role_custom: "" };
      else {
        const r = rates.find(x => x.role === roleKey);
        if (!r) m[mi] = { ...cur, role_key: roleKey };
        else {
          const g = r.grades.find(gg => gg.g === cur.grade) || r.grades[0];
          m[mi] = { ...cur, role_key: roleKey, role_custom: "", category: r.category || "other", grade: g ? g.g : "", rate: g ? g.r : cur.rate };
        }
      }
      return m;
    });
  }
  function changeGrade(mi, gradeVal) {
    setMembers(p => {
      const m = p.slice(); const cur = m[mi];
      const r = cur.role_key && cur.role_key !== "__custom" ? rates.find(x => x.role === cur.role_key) : null;
      if (r) { const g = r.grades.find(x => x.g === gradeVal); m[mi] = { ...cur, grade: gradeVal, ...(g ? { rate: g.r } : {}) }; }
      else m[mi] = { ...cur, grade: gradeVal };
      return m;
    });
  }
  function delMember(mi) { setMembers(p => p.filter((_, j) => j !== mi)); }
  function reset() {
    if (members.length === 0) return;
    if (!confirm("입력한 내용을 모두 지울까요?")) return;
    setMembers([]); setMonths(3);
  }

  const m = Math.max(0.25, Number(months) || 1);
  const memberMonthly = members.map(mb => Number(mb.weekly_hours || 0) * 4 * Number(mb.rate || 0));
  const subTotal = memberMonthly.reduce((s, v) => s + v, 0);
  const subscription = { monthly: subTotal, total: Math.round(subTotal * m), months: m };
  const aiHMonthly = Math.round(subscription.monthly * 0.7);
  const aiHMonths = Math.round(m * 0.7 * 100) / 100;
  const aiH = { monthly: aiHMonthly, total: Math.round(aiHMonthly * aiHMonths), months: aiHMonths };

  function copyText() {
    if (members.length === 0) { alert("멤버를 추가해주세요"); return; }
    const lines = [];
    lines.push("[빠른 견적 — 상담 참고용]"); lines.push("");
    lines.push("팀 구성:");
    members.forEach((mb, i) => {
      const role = mb.role_key === "__custom" ? mb.role_custom : (mb.role_key || "직무 미지정");
      const monthlyAmt = Number(mb.weekly_hours || 0) * 4 * Number(mb.rate || 0);
      lines.push(`  ${i + 1}. ${role}${mb.grade ? " / " + mb.grade : ""} — 주 ${mb.weekly_hours || 0}h × ${(Number(mb.rate) || 0).toLocaleString()}원/h = ${monthlyAmt.toLocaleString()}원/월`);
    });
    lines.push("");
    lines.push(`총 투입 기간: ${m}개월 (휴먼 기준)`); lines.push("");
    lines.push("┌─ 구독작업자 (휴먼 전용)");
    lines.push(`│  월 ${subscription.monthly.toLocaleString()}원`);
    lines.push(`│  ${subscription.months}개월 합계 ${subscription.total.toLocaleString()}원`);
    lines.push("└─"); lines.push("");
    lines.push("┌─ AI+H (AI Agent + 휴먼)");
    lines.push(`│  월 ${aiH.monthly.toLocaleString()}원`);
    lines.push(`│  예상 기간 ${aiH.months}개월 / 합계 ${aiH.total.toLocaleString()}원`);
    lines.push(`│  ※ AI Agent 토큰 비용 별도 (실비, 월 상한 1,000,000원)`);
    lines.push("└─"); lines.push("");
    lines.push("VAT 별도 / 본 견적은 상담 참고용입니다.");
    const text = lines.join("\n");
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;
  const iSt = { padding: "7px 9px", borderRadius: 6, border: "1.5px solid " + c.inputBorder, background: c.inputBg, fontSize: 12, color: c.text, outline: "none" };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999 }} />
      <div style={{ position: "fixed", top: 0, right: 0, width: 580, maxWidth: "95vw", height: "100vh", background: c.card, boxShadow: "-8px 0 32px rgba(0,0,0,0.2)", zIndex: 1000, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid " + c.divider, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🧮</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>시급 계산기</span>
            </div>
            <div style={{ fontSize: 11, color: c.textSub, marginTop: 3 }}>상담 중 빠른 견적용 · 저장되지 않음</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={reset} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid " + c.inputBorder, background: "transparent", color: c.textSub, fontSize: 11, cursor: "pointer" }}>초기화</button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: c.textSub, lineHeight: 1 }}>×</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 12px", background: c.bg2, borderRadius: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>총 투입 기간 (휴먼 기준)</span>
            <input type="number" step="0.25" min="0.25" value={months} onChange={e => setMonths(Number(e.target.value) || 1)} style={{ ...iSt, width: 80, textAlign: "center" }} />
            <span style={{ fontSize: 12, color: c.text }}>개월</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub, textTransform: "uppercase" }}>팀 구성</div>
            <button onClick={addMember} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid " + c.brand, background: c.brandLight, color: c.brand, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ 멤버 추가</button>
          </div>
          {members.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: c.textHint, fontSize: 13, background: c.bg2, borderRadius: 8, marginBottom: 14 }}>
              멤버를 추가해 견적을 산출하세요
            </div>
          )}
          {members.map((mb, mi) => {
            const isCustom = !mb.role_key || mb.role_key === "__custom";
            const roleData = !isCustom ? rates.find(r => r.role === mb.role_key) : null;
            const gradeOptions = roleData ? roleData.grades : [];
            const monthlyAmt = Number(mb.weekly_hours || 0) * 4 * Number(mb.rate || 0);
            return (
              <div key={mb.id} style={{ marginBottom: 8, padding: "10px 12px", borderRadius: 8, border: "1px solid " + c.divider, background: c.bg }}>
                <div style={{ display: "grid", gridTemplateColumns: isCustom ? "1fr 1fr 1fr auto" : "1fr 1fr auto", gap: 6, marginBottom: 6 }}>
                  <select value={mb.role_key || ""} onChange={e => changeRole(mi, e.target.value)} style={iSt}>
                    <option value="">-- 직무 --</option>
                    {rates.map(r => <option key={r.role} value={r.role}>{r.role}</option>)}
                    <option value="__custom">+ 직접 입력</option>
                  </select>
                  {isCustom && (
                    <input value={mb.role_custom || ""} onChange={e => updMember(mi, "role_custom", e.target.value)} placeholder="직무명" style={iSt} />
                  )}
                  {isCustom ? (
                    <input value={mb.grade || ""} onChange={e => updMember(mi, "grade", e.target.value)} placeholder="등급" style={iSt} />
                  ) : (
                    <select value={mb.grade || ""} onChange={e => changeGrade(mi, e.target.value)} style={iSt}>
                      <option value="">-- 등급 --</option>
                      {gradeOptions.map(g => <option key={g.g} value={g.g}>{g.g} ({g.r.toLocaleString()}원)</option>)}
                    </select>
                  )}
                  <button onClick={() => delMember(mi)} style={{ background: "none", border: "none", cursor: "pointer", color: "#FA5252", fontSize: 16, alignSelf: "center" }}>×</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 6, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, color: c.textSub, marginBottom: 2, fontWeight: 600 }}>주 시간</div>
                    <input type="number" value={mb.weekly_hours || ""} onChange={e => updMember(mi, "weekly_hours", Number(e.target.value))} placeholder="주 h" style={{ ...iSt, width: "100%" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: c.textSub, marginBottom: 2, fontWeight: 600 }}>시급(원)</div>
                    <input type="number" value={mb.rate || ""} onChange={e => updMember(mi, "rate", Number(e.target.value))} placeholder="시급" style={{ ...iSt, width: "100%" }} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: c.textSub, marginBottom: 2, fontWeight: 600 }}>월 금액</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{monthlyAmt.toLocaleString()}원</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {members.length > 0 && (
          <div style={{ borderTop: "1px solid " + c.divider, padding: "16px 20px", background: c.bg2 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.textSub, marginBottom: 10, textTransform: "uppercase" }}>견적 비교</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: c.card, border: "1px solid " + c.divider }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.textSub, marginBottom: 6, textTransform: "uppercase" }}>구독작업자</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4 }}>{subscription.monthly.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 600, color: c.textSub, marginLeft: 3 }}>원/월</span></div>
                <div style={{ fontSize: 11, color: c.textSub, paddingTop: 6, borderTop: "1px solid " + c.divider }}>
                  {subscription.months}개월 합계
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginTop: 2 }}>{subscription.total.toLocaleString()}원</div>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: c.brandLight, border: "1.5px solid " + c.brand }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.brand, marginBottom: 6, textTransform: "uppercase" }}>AI+H</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.brand, marginBottom: 4 }}>{aiH.monthly.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, marginLeft: 3 }}>원/월</span></div>
                <div style={{ fontSize: 11, color: c.brand, paddingTop: 6, borderTop: "1px solid " + c.brand + "33", opacity: 0.85 }}>
                  예상 기간 {aiH.months}개월
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.brand, marginTop: 2 }}>{aiH.total.toLocaleString()}원</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "8px 12px", background: c.brand + "15", borderRadius: 6, fontSize: 10, color: c.brand, marginBottom: 10 }}>
              ※ AI+H 선택 시 AI Agent 토큰 비용 별도 (실비, 월 상한 1,000,000원)
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={copyText} c={c} style={{ padding: "8px 18px", fontSize: 12 }}>{copied ? "복사됨 ✓" : "📋 텍스트 복사"}</Btn>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
