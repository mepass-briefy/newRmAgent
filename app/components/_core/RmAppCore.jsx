"use client";
// 자동 생성: scripts/build-core.js
// 원본 crm_rm/rm_work_board_v2.jsx의 line 582-3687 (FirstSetup 이전까지) 추출.
// 중복된 const 블록(원본 803-1019)은 @/app/lib/{constants,utils}로 이동되어 제거.

import React, { useState, useEffect, useRef } from "react";
import { useTheme, useRates, useCategories } from "@/app/lib/context";
import { store } from "@/app/lib/store";
import { callClaude } from "@/app/lib/ai";
import {
  H, STATUS_MAP, STAGE_ORDER, STATUSES, INDUSTRIES, DEVICES, WORKER_TYPES,
  GRADE_ORDER, ROLES, DEFAULT_PERMS, MENU_LABELS,
  DEFAULT_RATES, DEFAULT_CATEGORIES, CATEGORIES_KEY,
  AI_DISCOUNT_RATE, AI_DURATION_REDUCTION, HARNESS_RATE_MULTIPLIER,
  VARIANT_MODES, CONTRACT_TYPES,
  DEFAULT_AI_CONFIG, DEFAULT_PROPOSAL,
  PATTERN_KEY, PATTERN_LIMIT,
  HARNESS_INDICATOR_COLOR, APP_VERSION,
} from "@/app/lib/constants";
import {
  todayInfo, migrateRates, getCompletedStages, autoStatus, applyCorrections,
  withId, migrateMember, newVariant, migrateProposal, normalizeMember,
  harnessMul, effectiveRate,
  calcAmount, calcMemberMonthAmount, calcVariantMonthSplit, calcVariantMonthHuman,
  calcVariantSplitTotal, calcVariantHumanTotal, calcVariantAvgMonthly, calcVariantTotals,
  readFileAsBase64, readFileAsText, loadCustomers,
  getPatterns, setPatterns, buildRevisionPatternsBlock, isSimilarPattern, addPattern,
  roleGroupOf,
} from "@/app/lib/utils";
import { Btn, Inp, Card, Badge, Toggle, Loading, BackBtn, ChipBtn, IC } from "@/app/components/ui";

// 원본의 "todayStr / todayDate / korDay"는 useTheme에서 매번 호출되지 않아
// 모듈 평가 시점에 한 번 계산되었음. 동일 거동 재현.
const _today = todayInfo();
const todayStr = _today.str;
const todayDate = _today.date;
const korDay = _today.korDay;

function AlertBell({ alerts, showRM }){
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  if(alerts.length === 0) return null;
  const needsCheck = alerts.filter(a => a.status === "신규접수");
  const salesWarn = alerts.filter(a => a.status !== "신규접수");
  function Section({ title, items }){
    if(items.length === 0) return null;
    return (
      <div>
        <div style={{padding:"9px 14px",background:c.bg2,fontSize:10,fontWeight:700,color:c.textSub,textTransform:"uppercase",letterSpacing:"0.05em",display:"flex",justifyContent:"space-between"}}>
          <span>{title}</span><span style={{color:c.brand}}>{items.length}건</span>
        </div>
        {items.map((a, i) => (
          <div key={a.id} style={{padding:"11px 14px",borderBottom:i<items.length-1?"1px solid "+c.divider:"none",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>{a.company}</div>
              <div style={{fontSize:11,color:c.textSub,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <span><b style={{color:"#FA5252"}}>{a.days}일간</b> 변화 없음</span>
                {showRM && <span style={{color:c.textHint}}>·</span>}
                {showRM && <span>담당 <b style={{color:a.rm_name?c.text:c.textHint}}>{a.rm_name || "미배정"}</b></span>}
              </div>
            </div>
            <Badge status={a.status}/>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{position:"relative"}}>
      <button onClick={() => setOpen(p => !p)} title={"3일 이상 변화 없음 "+alerts.length+"건"}
        style={{position:"relative",width:36,height:36,border:"1px solid "+(open?c.brand:c.inputBorder),background:open?c.brandLight:c.card,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:open?c.brand:c.textSub}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
        <span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,padding:"0 4px",borderRadius:8,background:"#FA5252",color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,boxSizing:"border-box"}}>{alerts.length}</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:"fixed",inset:0,zIndex:99}}/>
          <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,width:360,background:c.card,border:"1px solid "+c.cardBorder,borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",zIndex:100,overflow:"hidden"}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid "+c.divider,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:c.text}}>액션 알림</div>
                <div style={{fontSize:11,color:c.textSub,marginTop:1}}>3일 이상 변화 없음 · 총 {alerts.length}건</div>
              </div>
              <button onClick={() => setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:c.textSub}}>×</button>
            </div>
            <div style={{maxHeight:400,overflowY:"auto"}}>
              <Section title="확인 필요" items={needsCheck}/>
              <Section title="영업상태 주의" items={salesWarn}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Dashboard({ user }){
  const { c } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("주간");
  const KEY = "customers:"+user.id;
  useEffect(() => { loadCustomers(KEY).then(d => { setCustomers(d); setLoading(false); }); }, [user.id]);
  const now = Date.now();
  const ms = period==="일간"?86400000 : period==="주간"?7*86400000 : 30*86400000;
  const filtered = customers.filter(cu => now - new Date(cu.created_at) < ms);
  const won = filtered.filter(cu => cu.status === "계약성사").length;
  const lost = filtered.filter(cu => cu.status === "이탈").length;
  const active = filtered.filter(cu => !["계약성사","이탈"].includes(cu.status)).length;
  const alerts = customers
    .filter(cu => !["계약성사","이탈"].includes(cu.status))
    .map(cu => ({...cu, days: Math.floor((now - new Date(cu.last_action_at))/86400000)}))
    .filter(cu => cu.days >= 3);
  const canSeeRM = !!(user && (user.isAdmin || user.grade === "관리자" || user.grade === "팀장" || user.grade === "Lead RM"));
  if(loading) return <Loading/>;
  const stats = [{label:"전체 접수",value:filtered.length,icon:"📋"},{label:"진행 중",value:active,icon:"⚡"},{label:"계약 성사",value:won,icon:"🏆"},{label:"이탈",value:lost,icon:"📉"}];
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:c.text,marginBottom:3}}>대시보드</div>
            <div style={{fontSize:13,color:c.textSub}}>전체 CRM 현황</div>
          </div>
          <AlertBell alerts={alerts} showRM={canSeeRM}/>
        </div>
        <div style={{display:"flex",gap:4,background:c.bg2,borderRadius:8,padding:3}}>
          {["일간","주간","월간"].map(p => <button key={p} onClick={() => setPeriod(p)} style={{padding:"5px 13px",borderRadius:6,fontSize:12,cursor:"pointer",border:"none",background:period===p?c.card:"transparent",color:period===p?c.text:c.textSub,fontWeight:period===p?700:400}}>{p}</button>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {stats.map(s => (
          <Card key={s.label} c={c} style={{padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><div style={{fontSize:11,color:c.textSub,fontWeight:500,textTransform:"uppercase",marginBottom:6}}>{s.label}</div><div style={{fontSize:26,fontWeight:800,color:c.text}}>{s.value}</div></div>
              <div style={{width:38,height:38,borderRadius:8,background:c.brandLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card c={c}>
          <div style={{fontSize:14,fontWeight:600,color:c.text,marginBottom:16}}>파이프라인 현황</div>
          {STATUSES.map(s => {
            const cnt = customers.filter(cu => cu.status === s).length;
            const pct = Math.round((cnt/(customers.length||1))*100);
            return (
              <div key={s} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><Badge status={s}/><span style={{fontSize:12,fontWeight:700,color:c.text}}>{cnt}건</span></div>
                <div style={{height:4,borderRadius:4,background:c.bg2}}><div style={{height:4,borderRadius:4,width:Math.max(pct,2)+"%",background:c.brand}}/></div>
              </div>
            );
          })}
        </Card>
        <Card c={c}>
          <div style={{fontSize:14,fontWeight:600,color:c.text,marginBottom:16}}>최근 접수</div>
          {filtered.length === 0 ? <div style={{fontSize:13,color:c.textHint,textAlign:"center",padding:"16px 0"}}>해당 기간 데이터 없음</div> :
            filtered.slice(0,6).map((cu, i) => (
              <div key={cu.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:10,marginBottom:10,borderBottom:i<Math.min(filtered.length,6)-1?"1px solid "+c.divider:"none"}}>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:c.text}}>{cu.company}</div>
                  <div style={{fontSize:11,color:c.textSub,marginTop:2}}>{cu.contact_name} · {cu.created_at && cu.created_at.slice(0,10)}</div>
                </div>
                <Badge status={cu.status}/>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}

/* ─── RM SELECTOR ─── */
function RMSelector({ value, onChange, team, setTeam }){
  const { c } = useTheme();
  const [text, setText] = useState("");
  const [confirm, setConfirm] = useState(null);
  const registered = team.filter(t => !t.tagOnly);
  async function handleBlur(){
    const name = text.trim();
    if(!name) return;
    if(team.find(t => t.name === name)){ onChange(name); setText(""); return; }
    setConfirm(name);
  }
  async function handleConfirm(yes){
    const m = {id:String(Date.now()), name:confirm, grade:yes?"RM":"", email:"", tagOnly:!yes};
    const updated = team.concat([m]);
    setTeam(updated);
    await store.set("teams", updated);
    onChange(confirm);
    setText("");
    setConfirm(null);
  }
  return (
    <div>
      <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>담당 RM</div>
      <div style={{display:"flex",gap:8}}>
        <select value={value||""} onChange={e => { onChange(e.target.value); setText(""); }} style={{flex:1,padding:"10px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:value?c.text:c.textSub,outline:"none"}}>
          <option value="">-- 선택 --</option>
          {registered.map(t => <option key={t.id} value={t.name}>{t.name}{t.grade?" ("+t.grade+")":""}</option>)}
        </select>
        <input value={text} onChange={e => setText(e.target.value)} onBlur={handleBlur} placeholder="직접 입력" style={{flex:1,padding:"10px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:c.text,outline:"none"}}/>
      </div>
      {confirm && (
        <div style={{marginTop:10,padding:"12px 14px",borderRadius:8,background:c.brandLight}}>
          <div style={{fontSize:12,color:c.text,marginBottom:8}}><b style={{color:c.brand}}>{confirm}</b>은 등록되지 않은 팀원이에요.</div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={() => handleConfirm(true)} c={c} style={{padding:"6px 14px",fontSize:11}}>등록</Btn>
            <Btn onClick={() => handleConfirm(false)} variant="ghost" c={c} style={{padding:"6px 12px",fontSize:11}}>이름만 저장</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MARKDOWN ─── */
function renderInline(text, c){
  const BT = String.fromCharCode(96);
  const codePattern = new RegExp(BT+"([^"+BT+"]+)"+BT);
  const splitPattern = new RegExp("(\\*\\*[^*]+\\*\\*|"+BT+"[^"+BT+"]+"+BT+")", "g");
  const parts = text.split(splitPattern);
  return parts.map((part, i) => {
    if(/^\*\*(.+)\*\*$/.test(part)) return <strong key={i} style={{fontWeight:700,color:c.text}}>{part.slice(2,-2)}</strong>;
    const cm = part.match(codePattern);
    if(cm) return <code key={i} style={{fontFamily:"monospace",fontSize:11,background:c.bg2,padding:"1px 5px",borderRadius:4,color:c.brand}}>{cm[1]}</code>;
    return <span key={i}>{part}</span>;
  });
}

function MdBlock({ text, c }){
  if(!text) return null;
  const lines = text.split("\n");
  const els = [];
  let i = 0;
  while(i < lines.length){
    const line = lines[i];
    const h2 = line.match(/^##\s+(.+)/);
    if(h2){
      els.push(<div key={i} style={{fontSize:13,fontWeight:800,color:c.brand,marginTop:14,marginBottom:3,display:"flex",alignItems:"center",gap:6}}><span style={{width:3,height:14,borderRadius:2,background:c.brand}}/>{h2[1].replace(/\*\*/g,"")}</div>);
      i++; continue;
    }
    const bl = line.match(/^\*\*(.+)\*\*\s*$/);
    if(bl){ els.push(<div key={i} style={{fontSize:12,fontWeight:700,color:c.text,marginTop:6}}>{bl[1]}</div>); i++; continue; }
    const bullet = line.match(/^(\s*)([-*·])\s+(.+)/);
    if(bullet){
      const depth = Math.floor(bullet[1].length/2);
      els.push(<div key={i} style={{display:"flex",gap:5,paddingLeft:depth*12,marginBottom:1}}><span style={{color:c.brand,fontWeight:700,fontSize:11}}>·</span><span style={{fontSize:12,color:c.text,lineHeight:1.6}}>{renderInline(bullet[3], c)}</span></div>);
      i++; continue;
    }
    if(!line.trim()){ els.push(<div key={i} style={{height:4}}/>); i++; continue; }
    els.push(<div key={i} style={{fontSize:12,color:c.text,lineHeight:1.65}}>{renderInline(line, c)}</div>);
    i++;
  }
  return <div>{els}</div>;
}

/* ─── PROPOSAL ─── */
// 직무 카테고리는 CategoriesCtx에서 동적 조회

// variant 하나의 팀 테이블 + 금액 요약
function VariantCard({ plan, variant, vIdx, config }){
  const members = variant.members || [];
  const totals = calcVariantTotals(variant, config);
  const modeLabel = variant.mode === "ai_h" ? "AI+H" : "구독작업자";
  const modeColor = variant.mode === "ai_h" ? {bg:"#E7F5FF",fg:"#1971C2"} : {bg:"#F1F3F5",fg:"#495057"};
  return (
    <div style={{marginBottom:20,padding:"16px 18px",borderRadius:10,border:"1px solid #E9ECEF",background:"#fff"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #F0F0F0"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:14,fontWeight:800,color:"#16192C"}}>{plan.name} — {vIdx+1}안 {variant.label ? "("+variant.label+")" : ""}</div>
          <span style={{fontSize:10,padding:"3px 10px",borderRadius:10,background:modeColor.bg,color:modeColor.fg,fontWeight:700,letterSpacing:"0.02em"}}>{modeLabel}</span>
        </div>
      </div>
      {(variant.scope_of_work||[]).length > 0 && (
        <div style={{marginBottom:12,padding:"10px 12px",background:"#F8F9FA",borderRadius:6}}>
          <div style={{fontSize:11,fontWeight:700,color:"#6B7A99",marginBottom:6,textTransform:"uppercase"}}>업무 범위</div>
          {(variant.scope_of_work||[]).map((item, i) => <div key={i} style={{fontSize:12,color:"#495057",marginBottom:3}}>• {item}</div>)}
        </div>
      )}
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,marginBottom:12,border:"1px solid #E9ECEF"}}>
        <thead><tr style={{background:"#F8F9FA"}}>
          {["이름/포지션","역량","등급","계약","조건","월 금액 (평균)"].map(h => <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:"#6B7A99",fontSize:10,textTransform:"uppercase",borderBottom:"1px solid #E9ECEF"}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {members.length === 0 && <tr><td colSpan={6} style={{padding:16,textAlign:"center",color:"#ADB5BD"}}>팀원 없음</td></tr>}
          {members.map((m, i) => {
            const ct = m.contract_type || "hourly";
            let cond, amt;
            if(ct === "hourly"){ cond = (m.weekly_hours?"주 "+m.weekly_hours+"h":"-"); amt = m.rate ? Number(m.rate).toLocaleString()+"원/h" : "-"; }
            else if(ct === "monthly_fixed"){ cond = "월 정액"; amt = m.monthly_amount ? Number(m.monthly_amount).toLocaleString()+"원/월" : "-"; }
            else { cond = m.duration || "단기"; amt = m.total_amount ? Number(m.total_amount).toLocaleString()+"원(총)" : "-"; }
            return (
              <tr key={i} style={{borderBottom:"1px solid #F0F0F0",background:i%2===1?"#FAFAFA":"#fff"}}>
                <td style={{padding:"9px 10px",fontWeight:600,fontSize:12}}>{m.name || "-"}</td>
                <td style={{padding:"9px 10px",fontSize:11}}>{m.required_skills || "-"}</td>
                <td style={{padding:"9px 10px",fontSize:11}}>{m.grade || "-"}</td>
                <td style={{padding:"9px 10px",fontSize:11}}>{ct === "hourly" ? "시급제" : ct === "monthly_fixed" ? "월 정액" : "단기"}</td>
                <td style={{padding:"9px 10px",fontSize:11}}>{cond}</td>
                <td style={{padding:"9px 10px",fontSize:11,fontWeight:600,textAlign:"right"}}>{amt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {members.length > 0 && (
        <div style={{padding:"14px 16px",background:"#F8F9FA",borderRadius:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:16,fontWeight:800,color:"#16192C"}}>월 공급가</span>
            <span style={{fontSize:20,fontWeight:900,color:"#4C6EF5"}}>{totals.avgMonthly.toLocaleString()}원 / 월</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#6B7A99",paddingTop:8,borderTop:"1px solid #DEE2E6"}}>
            <span>총 투입 기간 {totals.months}개월 · 기간 합계</span>
            <span style={{fontWeight:600,color:"#495057"}}>{totals.teamTotal.toLocaleString()}원</span>
          </div>
          {totals.isAi && (
            <div style={{marginTop:6,padding:"8px 10px",background:"#E7F5FF",borderRadius:4,fontSize:11,color:"#1971C2"}}>
              ※ AI Agent 토큰 비용 별도 (실비, 월 상한 {totals.tokenCap.toLocaleString()}원)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProposalPreview({ data, planIdx, variantIdx }){
  const pi = planIdx || 0;
  const plans = data.plans || [];
  const plan = plans[pi] || plans[0] || {name:"A안", variants:[]};
  const variants = plan.variants || [];
  const activeVIdx = variantIdx != null ? Math.min(variantIdx, Math.max(0, variants.length - 1)) : 0;
  const config = data.ai_config || DEFAULT_AI_CONFIG;
  const subs = data.monitoring_subscriptions || [];
  return (
    <div style={{background:"#fff",borderRadius:8,border:"1px solid #E9ECEF",color:"#16192C",padding:"24px 28px"}}>
      <div style={{fontSize:11,fontWeight:700,color:"#4C6EF5",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>GRIDGE</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:16,paddingBottom:16,borderBottom:"2px solid #4C6EF5"}}>개발팀 구독 제안서</div>
      <div style={{fontSize:13,fontWeight:700,color:"#4C6EF5",margin:"16px 0 8px"}}>수신자 / 담당자</div>
      <div style={{fontSize:12,color:"#495057",marginBottom:4}}>수신: {data.recipient || "-"}</div>
      <div style={{fontSize:12,color:"#495057",marginBottom:16}}>담당 (GRIDGE): {data.rm_name || "-"}</div>
      <div style={{fontSize:13,fontWeight:700,color:"#4C6EF5",margin:"16px 0 8px"}}>프로젝트 개요</div>
      <div style={{fontSize:12,color:"#495057",whiteSpace:"pre-wrap",padding:"10px 14px",background:"#F8F9FA",borderRadius:6,marginBottom:16,lineHeight:1.7}}>{data.project_overview || "내용 없음"}</div>
      <div style={{fontSize:13,fontWeight:700,color:"#4C6EF5",margin:"16px 0 8px"}}>고객사 주요 사항</div>
      <div style={{fontSize:12,color:"#495057",marginBottom:4}}>의사결정권자: {data.decision_maker || "-"}</div>
      <div style={{fontSize:12,color:"#495057",marginBottom:16}}>협업 팀/담당자: {data.collaborators || "-"}</div>
      <div style={{fontSize:13,fontWeight:700,color:"#4C6EF5",margin:"16px 0 12px"}}>
        {plan.name} {plans.length>1 && <span style={{fontSize:11,color:"#6B7A99",fontWeight:400}}>({plans.length}개 안 중)</span>}
      </div>
      {variants.length === 0 && <div style={{padding:20,textAlign:"center",color:"#ADB5BD",fontSize:13}}>이 안에는 구성이 없습니다</div>}
      {variants.length > 0 && <VariantCard plan={plan} variant={variants[activeVIdx]} vIdx={activeVIdx} config={config}/>}
      {subs.length > 0 && (
        <>
          <div style={{fontSize:13,fontWeight:700,color:"#4C6EF5",margin:"24px 0 8px"}}>모니터링 툴 구독 (선택)</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,border:"1px solid #E9ECEF"}}>
            <thead><tr style={{background:"#F8F9FA"}}>
              {["상품","설명","월 구독료"].map(h => <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:"#6B7A99",fontSize:10,textTransform:"uppercase"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={i} style={{borderBottom:"1px solid #F0F0F0"}}>
                  <td style={{padding:"9px 10px",fontWeight:600,fontSize:12}}>{s.name||"-"}</td>
                  <td style={{padding:"9px 10px",fontSize:11}}>{s.desc||"-"}</td>
                  <td style={{padding:"9px 10px",fontSize:12,fontWeight:600,textAlign:"right"}}>{Number(s.monthly||0).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// 모니터링 툴 구독 (확장용)
function MonitoringSubsPanel({ subs, onChange, c }){
  const iSt = {padding:"7px 9px",borderRadius:6,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none"};
  function add(){ onChange((subs||[]).concat([{name:"",desc:"",monthly:0}])); }
  function upd(i, k, v){ const arr = (subs||[]).slice(); arr[i] = {...arr[i], [k]: v}; onChange(arr); }
  function del(i){ onChange((subs||[]).filter((_, j) => j !== i)); }
  return (
    <div style={{padding:"14px 16px",borderRadius:10,border:"1px solid "+c.inputBorder,background:c.bg2}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:(subs||[]).length>0?10:0}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:c.text}}>모니터링 툴 구독 <span style={{fontSize:10,color:c.textHint,fontWeight:400}}>(확장용)</span></div>
          <div style={{fontSize:11,color:c.textSub,marginTop:2}}>Zira 등 모니터링 상품을 팀빌딩 견적과 함께 또는 단독으로 제안</div>
        </div>
        <button onClick={add} style={{padding:"5px 12px",borderRadius:6,border:"1.5px solid "+c.brand,background:"transparent",color:c.brand,fontSize:11,fontWeight:600,cursor:"pointer"}}>+ 상품 추가</button>
      </div>
      {(subs||[]).map((s, i) => (
        <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr auto",gap:6,marginBottom:6}}>
          <input value={s.name||""} onChange={e => upd(i, "name", e.target.value)} placeholder="상품명 (예: Zira)" style={iSt}/>
          <input value={s.desc||""} onChange={e => upd(i, "desc", e.target.value)} placeholder="설명" style={iSt}/>
          <input type="number" value={s.monthly||""} onChange={e => upd(i, "monthly", Number(e.target.value))} placeholder="월 구독료" style={iSt}/>
          <button onClick={() => del(i)} style={{background:"none",border:"none",cursor:"pointer",color:"#FA5252",fontSize:16}}>×</button>
        </div>
      ))}
    </div>
  );
}

function VariantEditor({ variant, vIdx, onChange, onDelete, c }){
  const { rates } = useRates();
  const { categories } = useCategories();
  const iSt = {width:"100%",padding:"7px 9px",borderRadius:6,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none"};
  const members = variant.members || [];
  const months = Math.max(1, Number(variant.total_months || 1));
  const monthCount = Math.ceil(months);
  function upd(k, v){ onChange({...variant, [k]: v}); }
  function addScope(){ upd("scope_of_work", (variant.scope_of_work||[]).concat([""])); }
  function updScope(i, v){ const s = (variant.scope_of_work||[]).slice(); s[i] = v; upd("scope_of_work", s); }
  function delScope(i){ upd("scope_of_work", (variant.scope_of_work||[]).filter((_, j) => j !== i)); }
  function addMember(){
    upd("members", members.concat([withId({name:"",required_skills:"",role_key:"",role_custom:"",grade:"",category:"dev",contract_type:"hourly",weekly_hours:40,max_hours:50,rate:0})]));
  }
  function updMember(mi, k, v){
    const m = members.slice();
    m[mi] = withId({...m[mi], [k]: v});
    upd("members", m);
  }
  // 직무 변경 시: role_key 기반으로 카테고리/기본 등급/시급 자동 채움
  function changeRole(mi, roleKey){
    const m = members.slice();
    const cur = m[mi];
    if(roleKey === "__custom"){
      m[mi] = withId({...cur, role_key: "__custom", role_custom: cur.role_custom || ""});
    } else if(roleKey === ""){
      m[mi] = withId({...cur, role_key: "", role_custom: ""});
    } else {
      const r = rates.find(x => x.role === roleKey);
      if(!r){ m[mi] = withId({...cur, role_key: roleKey}); }
      else {
        // 기존 등급이 이 직무에 있으면 유지, 없으면 첫 등급
        const gradeToUse = r.grades.find(g => g.g === cur.grade) || r.grades[0];
        m[mi] = withId({
          ...cur,
          role_key: roleKey,
          role_custom: "",
          category: r.category || cur.category || "other",
          grade: gradeToUse ? gradeToUse.g : "",
          rate: gradeToUse ? gradeToUse.r : cur.rate,
        });
      }
    }
    upd("members", m);
  }
  // 등급 변경 시 시급 자동 갱신 (마스터 직무일 때만)
  function changeGrade(mi, gradeVal){
    const m = members.slice();
    const cur = m[mi];
    const r = cur.role_key && cur.role_key !== "__custom" ? rates.find(x => x.role === cur.role_key) : null;
    if(r){
      const g = r.grades.find(x => x.g === gradeVal);
      m[mi] = withId({...cur, grade: gradeVal, ...(g ? {rate: g.r} : {})});
    } else {
      m[mi] = withId({...cur, grade: gradeVal});
    }
    upd("members", m);
  }
  function delMember(mi){ upd("members", members.filter((_, j) => j !== mi)); }
  function updMonthlyHour(mid, monthKey, val){
    const mh = {...(variant.monthly_hours||{})};
    if(!mh[mid]) mh[mid] = {};
    else mh[mid] = {...mh[mid]};
    if(val === "" || val == null) delete mh[mid][monthKey];
    else mh[mid][monthKey] = Number(val);
    upd("monthly_hours", mh);
  }
  const isAi = variant.mode === "ai_h";
  const totals = calcVariantTotals(variant, null);
  const catLabel = (id) => { const c2 = categories.find(x => x.id === id); return c2 ? c2.label : id; };

  return (
    <div style={{marginBottom:14,padding:"14px 16px",borderRadius:10,border:"1.5px solid "+(isAi?c.brand:c.inputBorder),background:c.card}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13,fontWeight:700,color:c.text}}>{vIdx+1}안</span>
          <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:isAi?c.brandLight:c.bg2,color:isAi?c.brand:c.textSub,fontWeight:700}}>{isAi?"AI+H":"구독작업자"}</span>
        </div>
        <button onClick={onDelete} style={{background:"none",border:"none",cursor:"pointer",color:"#FA5252",fontSize:14}}>삭제</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:c.textSub,marginBottom:5,textTransform:"uppercase"}}>구성 라벨 (선택)</div>
          <input value={variant.label||""} onChange={e => upd("label", e.target.value)} placeholder="예: 최소 구성" style={iSt}/>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:c.textSub,marginBottom:5,textTransform:"uppercase"}}>모드</div>
          <select value={variant.mode||"subscription"} onChange={e => upd("mode", e.target.value)} style={iSt}>
            {VARIANT_MODES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:c.textSub,marginBottom:5,textTransform:"uppercase"}}>총 투입 기간 (개월)</div>
          <input type="number" step="0.25" min="0.25" value={variant.total_months||1} onChange={e => upd("total_months", Number(e.target.value)||1)} style={iSt}/>
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:c.textSub,marginBottom:5,textTransform:"uppercase"}}>업무 범위</div>
        {(variant.scope_of_work||[]).map((item, i) => (
          <div key={i} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
            <span style={{color:c.brand,fontWeight:700}}>•</span>
            <input value={item} onChange={e => updScope(i, e.target.value)} style={{...iSt, flex:1}}/>
            <button onClick={() => delScope(i)} style={{background:"none",border:"none",cursor:"pointer",color:"#FA5252",fontSize:16}}>×</button>
          </div>
        ))}
        <button onClick={addScope} style={{padding:"4px 10px",borderRadius:6,border:"1.5px solid "+c.brand,background:"transparent",color:c.brand,fontSize:11,fontWeight:600,cursor:"pointer"}}>+ 범위 추가</button>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:c.textSub,marginBottom:5,textTransform:"uppercase"}}>팀 구성</div>
        {members.map((m, mi) => {
          const ct = m.contract_type || "hourly";
          const isCustom = !m.role_key || m.role_key === "__custom";
          const roleData = !isCustom ? rates.find(r => r.role === m.role_key) : null;
          const gradeOptions = roleData ? roleData.grades : [];
          return (
            <div key={m.id||mi} style={{marginBottom:10,padding:"10px 12px",borderRadius:8,border:"1px solid "+c.divider,background:c.bg}}>
              {/* Row 1: 이름 · 역량 · 삭제 */}
              <div style={{display:"grid",gridTemplateColumns:"1.2fr 2fr auto",gap:6,marginBottom:6}}>
                <input value={m.name||""} onChange={e => updMember(mi, "name", e.target.value)} placeholder="이름/포지션 (예: 김개발)" style={iSt}/>
                <input value={m.required_skills||""} onChange={e => updMember(mi, "required_skills", e.target.value)} placeholder="필수 역량" style={iSt}/>
                <button onClick={() => delMember(mi)} style={{background:"none",border:"none",cursor:"pointer",color:"#FA5252",fontSize:16,alignSelf:"center"}}>×</button>
              </div>
              {/* Row 2: 직무 · (자유 입력 시 직무명) · 등급 · 카테고리 · 계약 */}
              <div style={{display:"grid",gridTemplateColumns:isCustom?"1.1fr 1.1fr 0.9fr 0.9fr 1fr":"1.1fr 1fr 0.9fr 1fr",gap:6,marginBottom:6}}>
                <select value={m.role_key || ""} onChange={e => changeRole(mi, e.target.value)} style={iSt}>
                  <option value="">-- 직무 선택 --</option>
                  {rates.map(r => <option key={r.role} value={r.role}>{r.role} ({catLabel(r.category)})</option>)}
                  <option value="__custom">+ 직접 입력</option>
                </select>
                {isCustom && (
                  <input value={m.role_custom||""} onChange={e => updMember(mi, "role_custom", e.target.value)} placeholder="직무명 직접 입력" style={iSt}/>
                )}
                {isCustom ? (
                  <input value={m.grade||""} onChange={e => updMember(mi, "grade", e.target.value)} placeholder="등급 (자유 입력)" style={iSt}/>
                ) : (
                  <select value={m.grade || ""} onChange={e => changeGrade(mi, e.target.value)} style={iSt}>
                    <option value="">-- 등급 --</option>
                    {gradeOptions.map(g => <option key={g.g} value={g.g}>{g.g} ({g.r.toLocaleString()}원/h)</option>)}
                  </select>
                )}
                <select value={m.category||"dev"} onChange={e => updMember(mi, "category", e.target.value)} style={iSt} disabled={!isCustom} title={isCustom?"":"선택된 직무에 따라 자동 결정됩니다"}>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
                <select value={ct} onChange={e => updMember(mi, "contract_type", e.target.value)} style={iSt}>
                  {CONTRACT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {ct === "hourly" && (
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                    <input type="number" value={m.weekly_hours||""} onChange={e => updMember(mi, "weekly_hours", Number(e.target.value))} placeholder="기본 주 h" style={iSt}/>
                    <input type="number" value={m.max_hours||""} onChange={e => updMember(mi, "max_hours", Number(e.target.value))} placeholder="최대 h" style={iSt}/>
                    <input type="number" value={m.rate||""} onChange={e => updMember(mi, "rate", Number(e.target.value))} placeholder="시급(원) — 직무/등급 선택 시 자동" style={iSt}/>
                  </div>
                  {monthCount > 1 && (
                    <div style={{padding:"8px 10px",borderRadius:6,background:c.brandLight+"66",border:"1px dashed "+c.brand+"44"}}>
                      <div style={{fontSize:10,fontWeight:700,color:c.brand,marginBottom:6,textTransform:"uppercase"}}>월별 투입 시간 (미입력 시 기본 주 h × 4 적용)</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat("+Math.min(monthCount,6)+", 1fr)",gap:6}}>
                        {Array.from({length: monthCount}, (_, mIdx) => {
                          const monthKey = String(mIdx + 1);
                          const mh = (variant.monthly_hours||{})[m.id] || {};
                          const val = mh[monthKey];
                          const defaultH = Number(m.weekly_hours||0) * 4;
                          return (
                            <div key={mIdx}>
                              <div style={{fontSize:10,color:c.textSub,marginBottom:3}}>{mIdx+1}개월차</div>
                              <input type="number" value={val != null ? val : ""} onChange={e => updMonthlyHour(m.id, monthKey, e.target.value)} placeholder={defaultH+"h"} style={{...iSt, padding:"5px 7px"}}/>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
              {ct === "monthly_fixed" && (
                <input type="number" value={m.monthly_amount||""} onChange={e => updMember(mi, "monthly_amount", Number(e.target.value))} placeholder="월 정액 금액(원)" style={iSt}/>
              )}
              {ct === "short_term" && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <input value={m.duration||""} onChange={e => updMember(mi, "duration", e.target.value)} placeholder="기간" style={iSt}/>
                  <input type="number" value={m.total_amount||""} onChange={e => updMember(mi, "total_amount", Number(e.target.value))} placeholder="총 금액(원)" style={iSt}/>
                </div>
              )}
            </div>
          );
        })}
        <button onClick={addMember} style={{padding:"4px 10px",borderRadius:6,border:"1.5px solid "+c.brand,background:"transparent",color:c.brand,fontSize:11,fontWeight:600,cursor:"pointer"}}>+ 멤버 추가</button>
        <div style={{fontSize:10,color:c.textHint,marginTop:6}}>RM은 작업자 수수료에 포함됩니다. RM이 직접 업무 투입되는 경우에만 RM 카테고리로 추가하세요.</div>
      </div>
      {members.length > 0 && (
        <div style={{padding:"10px 12px",background:c.bg2,borderRadius:6}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
            <span style={{fontWeight:700,color:c.text}}>월 공급가</span>
            <span style={{fontWeight:800,color:c.brand,fontSize:15}}>{totals.avgMonthly.toLocaleString()}원 / 월</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:c.textSub,marginTop:4}}>
            <span>총 {totals.months}개월 합계</span>
            <span style={{fontWeight:600}}>{totals.teamTotal.toLocaleString()}원</span>
          </div>
          {isAi && <div style={{fontSize:10,color:c.brand,marginTop:4}}>※ AI Agent 토큰 비용 별도 (월 상한 {(totals.tokenCap||1000000).toLocaleString()}원)</div>}
        </div>
      )}
    </div>
  );
}

function ProposalEditForm({ data, onChange }){
  const { c } = useTheme();
  const [activePlan, setActivePlan] = useState(0);
  const plans = data.plans || [{name:"A안", variants:[newVariant("subscription")]}];
  const safeIdx = Math.max(0, Math.min(activePlan, plans.length - 1));
  const plan = plans[safeIdx] || {name:"A안", variants:[]};
  const config = data.ai_config || DEFAULT_AI_CONFIG;
  function upd(k, v){ onChange({...data, [k]: v}); }
  function updPlanField(k, v){
    const np = plans.slice();
    np[safeIdx] = {...np[safeIdx], [k]: v};
    upd("plans", np);
  }
  function updVariant(vi, v){
    const nv = (plan.variants||[]).slice();
    nv[vi] = v;
    updPlanField("variants", nv);
  }
  function addVariant(mode){
    if((plan.variants||[]).length >= 2){ alert("한 안에는 최대 2개 구성까지 가능합니다"); return; }
    updPlanField("variants", (plan.variants||[]).concat([newVariant(mode)]));
  }
  function delVariant(vi){
    if((plan.variants||[]).length <= 1){ alert("최소 1개 구성은 필요합니다"); return; }
    updPlanField("variants", (plan.variants||[]).filter((_, j) => j !== vi));
  }
  function addPlan(){
    if(plans.length >= 2) return;
    upd("plans", plans.concat([{name:"B안", variants:[newVariant("subscription")]}]));
  }
  function delPlan(pi){
    if(plans.length <= 1) return;
    upd("plans", plans.filter((_, j) => j !== pi));
    setActivePlan(cur => Math.min(cur, plans.length - 2));
  }
  const iSt = {width:"100%",padding:"7px 9px",borderRadius:6,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none"};

  return (
    <div style={{display:"grid",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="수신자" value={data.recipient} onChange={v => upd("recipient", v)} c={c}/>
        <Inp label="담당자 (GRIDGE)" value={data.rm_name} onChange={v => upd("rm_name", v)} c={c}/>
      </div>
      <div>
        <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>프로젝트 개요 <span style={{fontSize:10,color:c.textHint,fontWeight:400}}>(RFP 관점 — 왜 이 팀이 필요한지)</span></div>
        <textarea value={data.project_overview||""} onChange={e => upd("project_overview", e.target.value)} rows={5} style={{...iSt, resize:"vertical"}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="의사결정권자" value={data.decision_maker} onChange={v => upd("decision_maker", v)} c={c}/>
        <Inp label="협업 팀/담당자" value={data.collaborators} onChange={v => upd("collaborators", v)} c={c}/>
      </div>
      <div style={{borderTop:"1px solid "+c.divider,paddingTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:c.text}}>제안 구조</div>
          {plans.length < 2 && <button onClick={addPlan} style={{padding:"5px 12px",borderRadius:6,border:"1.5px solid "+c.brand,background:"transparent",color:c.brand,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ B안 추가</button>}
        </div>
        {plans.length > 1 && (
          <div style={{display:"flex",gap:4,borderBottom:"1px solid "+c.divider,marginBottom:14}}>
            {plans.map((p, pi) => (
              <div key={pi} style={{display:"flex",alignItems:"center"}}>
                <button onClick={() => setActivePlan(pi)} style={{padding:"7px 14px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:safeIdx===pi?700:400,color:safeIdx===pi?c.brand:c.textSub,borderBottom:safeIdx===pi?"2px solid "+c.brand:"2px solid transparent",marginBottom:-1}}>
                  {p.name} <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,marginLeft:4,background:c.bg2,color:c.textSub,fontWeight:700}}>{(p.variants||[]).length}안</span>
                </button>
                <button onClick={() => delPlan(pi)} style={{background:"none",border:"none",cursor:"pointer",color:c.textHint,fontSize:13}}>×</button>
              </div>
            ))}
          </div>
        )}
        <Inp label="안 이름" value={plan.name} onChange={v => updPlanField("name", v)} c={c}/>
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:c.textSub,textTransform:"uppercase"}}>{plan.name} 내부 구성 (최대 2개)</div>
            <div style={{display:"flex",gap:6}}>
              {(plan.variants||[]).length < 2 && (
                <>
                  <button onClick={() => addVariant("ai_h")} style={{padding:"4px 10px",borderRadius:6,border:"1.5px solid "+c.brand,background:c.brandLight,color:c.brand,fontSize:11,fontWeight:600,cursor:"pointer"}}>+ AI+H</button>
                  <button onClick={() => addVariant("subscription")} style={{padding:"4px 10px",borderRadius:6,border:"1.5px solid "+c.inputBorder,background:"transparent",color:c.text,fontSize:11,fontWeight:600,cursor:"pointer"}}>+ 구독작업자</button>
                </>
              )}
            </div>
          </div>
          {(plan.variants||[]).map((v, vi) => (
            <VariantEditor key={vi} variant={v} vIdx={vi} onChange={nv => updVariant(vi, nv)} onDelete={() => delVariant(vi)} c={c}/>
          ))}
        </div>
      </div>
      <MonitoringSubsPanel subs={data.monitoring_subscriptions||[]} onChange={v => upd("monitoring_subscriptions", v)} c={c}/>
    </div>
  );
}

// AI 재제안 시 기존 멤버의 수동 편집값(시급·등급·시간·하네스 등)을 보존하며 병합
function mergeAiMembers(aiMembers, origMembers, rates, categories) {
  const usedOrigIdx = new Set();
  return (aiMembers || []).map(aiMem => {
    const normalized = normalizeMember(aiMem, rates, categories);
    const matchIdx = (origMembers || []).findIndex((om, i) =>
      !usedOrigIdx.has(i) && (
        (om.name && aiMem.name && om.name.trim() === aiMem.name.trim()) ||
        (om.role_key && aiMem.role_key && om.role_key === aiMem.role_key && !usedOrigIdx.has(i))
      )
    );
    if (matchIdx < 0) return normalized;
    usedOrigIdx.add(matchIdx);
    const orig = origMembers[matchIdx];
    return withId({
      ...normalized,
      rate: orig.rate || normalized.rate,
      grade: orig.grade || normalized.grade,
      weekly_hours: orig.weekly_hours || normalized.weekly_hours,
      max_hours: orig.max_hours || normalized.max_hours,
      is_harness: typeof orig.is_harness === "boolean" ? orig.is_harness : normalized.is_harness,
      contract_type: orig.contract_type || normalized.contract_type,
      ...(orig.months != null ? { months: orig.months } : {}),
    });
  });
}

function buildPrintHtml(data, planIdx, variantIdx){
  const pi = planIdx || 0;
  const plans = data.plans || [];
  const plan = plans[pi] || plans[0] || {name:"A안", variants:[]};
  const variants = plan.variants || [];
  const config = data.ai_config || DEFAULT_AI_CONFIG;
  const subs = data.monitoring_subscriptions || [];
  const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  function variantBlock(variant, vIdx){
    const members = variant.members || [];
    const totals = calcVariantTotals(variant, config);
    const modeLabel = variant.mode === "ai_h" ? "AI+H" : "구독작업자";
    const modeBg = variant.mode === "ai_h" ? "#E7F5FF" : "#F1F3F5";
    const modeFg = variant.mode === "ai_h" ? "#1971C2" : "#495057";
    const scopeItems = (variant.scope_of_work||[]).map(s => "<div style='margin-bottom:3px;font-size:12px;color:#495057'>• "+esc(s)+"</div>").join("");
    const rows = members.map((m, i) => {
      const ct = m.contract_type || "hourly";
      const ctLabel = ct === "hourly" ? "시급제" : ct === "monthly_fixed" ? "월 정액" : "단기";
      const cond = ct === "hourly" ? (m.weekly_hours?"주 "+m.weekly_hours+"h":"-") : ct === "monthly_fixed" ? "월 정액" : (m.duration||"단기");
      const amt = ct === "hourly" ? (m.rate?Number(m.rate).toLocaleString()+"원/h":"-") : ct === "monthly_fixed" ? (m.monthly_amount?Number(m.monthly_amount).toLocaleString()+"원/월":"-") : (m.total_amount?Number(m.total_amount).toLocaleString()+"원(총)":"-");
      return "<tr style='background:"+(i%2===1?"#FAFAFA":"#fff")+"'><td style='padding:8px 10px;font-weight:600'>"+esc(m.name||"-")+"</td><td style='padding:8px 10px'>"+esc(m.required_skills||"-")+"</td><td style='padding:8px 10px'>"+esc(m.grade||"-")+"</td><td style='padding:8px 10px'>"+ctLabel+"</td><td style='padding:8px 10px'>"+cond+"</td><td style='padding:8px 10px;font-weight:600;text-align:right'>"+amt+"</td></tr>";
    }).join("");
    const aiNote = totals.isAi ? "<div style='margin-top:6px;padding:8px 10px;background:#E7F5FF;border-radius:4px;font-size:11px;color:#1971C2'>※ AI Agent 토큰 비용 별도 (실비, 월 상한 "+totals.tokenCap.toLocaleString()+"원)</div>" : "";
    const summary = members.length > 0 ? "<div style='padding:14px 16px;background:#F8F9FA;border-radius:6px'>" +
      "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px'><span style=\"font-size:16px;font-weight:800\">월 공급가</span><span style=\"font-size:20px;font-weight:900;color:#4C6EF5\">"+totals.avgMonthly.toLocaleString()+"원 / 월</span></div>" +
      "<div style='display:flex;justify-content:space-between;font-size:11px;color:#6B7A99;padding-top:8px;border-top:1px solid #DEE2E6'><span>총 투입 기간 "+totals.months+"개월 · 기간 합계</span><span style=\"font-weight:600;color:#495057\">"+totals.teamTotal.toLocaleString()+"원</span></div>" +
      aiNote + "</div>" : "";
    return "<div style='margin-bottom:20px;padding:16px 18px;border-radius:10px;border:1px solid #E9ECEF;background:#fff'>" +
      "<div style='display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #F0F0F0'>" +
      "<div style='font-size:14px;font-weight:800'>"+esc(plan.name)+" — "+(vIdx+1)+"안 "+(variant.label?"("+esc(variant.label)+")":"")+"</div>" +
      "<span style='font-size:10px;padding:3px 10px;border-radius:10px;background:"+modeBg+";color:"+modeFg+";font-weight:700'>"+modeLabel+"</span></div>" +
      (scopeItems ? "<div style='margin-bottom:12px;padding:10px 12px;background:#F8F9FA;border-radius:6px'><div style=\"font-size:11px;font-weight:700;color:#6B7A99;margin-bottom:6px;text-transform:uppercase\">업무 범위</div>"+scopeItems+"</div>" : "") +
      "<table><thead><tr><th>이름/포지션</th><th>역량</th><th>등급</th><th>계약</th><th>조건</th><th style='text-align:right'>월 금액 (평균)</th></tr></thead><tbody>"+(rows||"<tr><td colspan='6' style='padding:16px;text-align:center;color:#ADB5BD'>팀원 없음</td></tr>")+"</tbody></table>" + summary +
      "</div>";
  }

  const targetVariants = variantIdx != null
    ? variants.slice(variantIdx, variantIdx + 1)
    : variants;
  const variantsHtml = targetVariants.map((v, i) => variantBlock(v, variantIdx != null ? variantIdx : i)).join("");

  let subsSection = "";
  if(subs.length > 0){
    const subRows = subs.map(s => "<tr><td style='padding:8px 10px;font-weight:600'>"+esc(s.name||"-")+"</td><td style='padding:8px 10px'>"+esc(s.desc||"-")+"</td><td style='padding:8px 10px;font-weight:600;text-align:right'>"+Number(s.monthly||0).toLocaleString()+"원</td></tr>").join("");
    subsSection = "<h3 style='color:#4C6EF5;margin-top:28px'>모니터링 툴 구독 (선택)</h3>" +
      "<table><thead><tr><th>상품</th><th>설명</th><th style='text-align:right'>월 구독료</th></tr></thead><tbody>"+subRows+"</tbody></table>";
  }

  return "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>"+esc(plan.name)+" — 개발팀 구독 제안서</title><style>body{font-family:Inter,sans-serif;color:#16192C;margin:0;padding:32px}@media print{body{padding:0}@page{margin:1cm}}table{width:100%;border-collapse:collapse;border:1px solid #E9ECEF;margin-bottom:12px}th{padding:8px 10px;text-align:left;background:#F8F9FA;font-size:10px;text-transform:uppercase;color:#6B7A99;font-weight:600}td{border-bottom:1px solid #F0F0F0;font-size:11px}h3{color:#4C6EF5;margin-top:20px;margin-bottom:8px;font-size:13px}</style></head><body>" +
    "<div style='font-size:11px;font-weight:700;color:#4C6EF5;text-transform:uppercase'>GRIDGE</div>" +
    "<div style='font-size:20px;font-weight:800;margin-bottom:16px;padding-bottom:16px;border-bottom:2px solid #4C6EF5'>개발팀 구독 제안서</div>" +
    "<div style='font-size:12px'>수신: "+esc(data.recipient||"-")+"</div>" +
    "<div style='margin-bottom:16px;font-size:12px'>담당 (GRIDGE): "+esc(data.rm_name||"-")+"</div>" +
    "<h3>프로젝트 개요</h3><div style='padding:10px 14px;background:#F8F9FA;white-space:pre-wrap;font-size:12px;line-height:1.7'>"+esc(data.project_overview||"-")+"</div>" +
    "<h3>고객사 주요사항</h3><div style='font-size:12px'>의사결정권자: "+esc(data.decision_maker||"-")+"</div>" +
    "<div style='margin-bottom:16px;font-size:12px'>협업: "+esc(data.collaborators||"-")+"</div>" +
    "<h3>"+esc(plan.name)+"</h3>" +
    variantsHtml +
    subsSection +
    "</body></html>";
}

function exportProposal(data, companyName, format, planIdx, variantIdx){
  const plans = data.plans || [{name:"안 1", members:[]}];
  const targets = (planIdx === undefined || planIdx === null) ? plans.map((_, i) => i) : [planIdx];
  targets.forEach((pi, n) => {
    const p = plans[pi];
    if(!p) return;
    const html = buildPrintHtml(data, pi, variantIdx);
    const filename = (companyName||"제안서")+"_팀빌딩제안서_"+(p.name||("안"+(pi+1)));
    const delay = n * 400;
    if(format === "pdf"){
      setTimeout(() => {
        const win = window.open("", "_blank");
        if(win){ win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 500); }
        else alert("팝업이 차단되었습니다.");
      }, delay);
    } else {
      setTimeout(() => {
        const blob = new Blob(["\ufeff"+html], {type:"application/msword"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename+".doc";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, delay);
    }
  });
}

const PROPOSAL_SYSTEM = `당신은 IT 리소스 매칭 컨설팅 회사 GRIDGE의 팀빌딩 제안서 작성 에이전트입니다.

## 핵심 포지셔닝 (내부 정책, 제안서 본문에는 절대 문구로 노출 금지)
"시니어 1명 채용보다 빠르고 유연하게" — AI+H 구성을 제시할 때 이 논리를 근거로 개요를 작성. 고객의 감정을 건드리지 않는 중립적·논리적 톤을 유지. "할인" "절감" "싸다" 등 가격 비교 문구는 쓰지 않음.

## 프로젝트 개요 작성 규칙
- RFP 관점: 고객의 요구를 완수하기 위한 팀 빌딩 제안
- 왜 이 팀이 필요한지 의미가 정확히 전달되어야 함
- 상담 기록과 브리핑의 최종 내용을 종합해 작성

## 업무 범위
각 안(plan)의 각 구성(variant)마다 독립적으로 작성. 구성이 다르면 업무 범위도 다를 수 있음.

## 출력 형식 (JSON만, 다른 텍스트 금지)
{
  "recipient": "",
  "rm_name": "",
  "project_overview": "",
  "decision_maker": "",
  "collaborators": "",
  "plans": [
    {
      "name": "A안",
      "variants": [
        {
          "mode": "ai_h" | "subscription",
          "label": "선택적 부제 (예: 최소 구성)",
          "scope_of_work": ["업무 1", "업무 2"],
          "total_months": 3,
          "members": [
            {
              "name": "포지션명 (예: 백엔드 리드)",
              "required_skills": "역량",
              "role_key": "제공된 직무 목록 중 하나의 role 이름을 그대로 사용. 해당 직무가 목록에 없으면 이 필드를 비우고 role_custom을 채움",
              "role_custom": "role_key가 목록에 없을 때만 자유 입력",
              "grade": "신입(1년) | 초급(2~3년) | 중급(4~6년) | 중급2(7~8년) | 고급(9년+) — 해당 직무의 등급 중 하나",
              "category": "직무 카테고리 id (예: dev, plan, qa, publisher, rm, other — role_key 선택 시 자동이므로 생략해도 무방)",
              "contract_type": "hourly",
              "weekly_hours": 40,
              "max_hours": 50,
              "rate": 38000
            }
          ]
        }
      ]
    }
  ]
}

## 규칙
- 각 plan의 variants는 최소 1개, 최대 2개
- variant.mode는 "ai_h" (AI Agent+휴먼) 또는 "subscription" (휴먼 전용)
- **role_key는 반드시 시스템이 제공한 직무 목록에서 선택**. 목록에 없는 직무가 필요한 경우에만 role_key를 빈 문자열로 두고 role_custom에 자유 입력
- role_key를 제공한 경우 rate는 해당 직무/등급의 시급을 그대로 사용
- RM은 기본적으로 팀 구성에 포함하지 말 것 (작업자 수수료에 포함됨). 오직 RM이 직접 업무 투입되는 경우에만 role_key="RM" 또는 category="rm"으로 포함
- AI 포함 관련 계산(30% 단축)은 시스템이 자동 처리하므로 당신이 금액을 조정할 필요 없음. 순수 휴먼 기준 팀 구성만 작성`;

// 모드 선택 다이얼로그 — AI 생성 시 제안 구조/variant 선택
function ModeSelectDialog({ onConfirm, onCancel }){
  const { c } = useTheme();
  const [step, setStep] = useState(1);
  const [structure, setStructure] = useState("single");  // "single" | "ab"
  const [planAVariants, setPlanAVariants] = useState(["subscription"]);
  const [planBVariants, setPlanBVariants] = useState(["subscription"]);

  function toggleVariant(which, val){
    const cur = which === "A" ? planAVariants : planBVariants;
    const setter = which === "A" ? setPlanAVariants : setPlanBVariants;
    if(cur.includes(val)){
      if(cur.length <= 1) return; // 최소 1개
      setter(cur.filter(x => x !== val));
    } else {
      if(cur.length >= 2) return; // 최대 2개
      setter(cur.concat([val]));
    }
  }
  function canProceed(){
    if(step === 1) return true;
    if(step === 2) return planAVariants.length >= 1;
    if(step === 3) return planBVariants.length >= 1;
    return false;
  }
  function submit(){
    const modes = [{name:"A안", variants: planAVariants}];
    if(structure === "ab") modes.push({name:"B안", variants: planBVariants});
    onConfirm({ structure, plans: modes });
  }

  const chk = (arr, val, onClick, label, desc) => (
    <button onClick={onClick} style={{flex:1,padding:"12px 14px",borderRadius:8,border:"1.5px solid "+(arr.includes(val)?c.brand:c.inputBorder),background:arr.includes(val)?c.brandLight:c.card,color:arr.includes(val)?c.brand:c.text,cursor:"pointer",textAlign:"left",position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <div style={{width:16,height:16,borderRadius:4,border:"1.5px solid "+(arr.includes(val)?c.brand:c.inputBorder),background:arr.includes(val)?c.brand:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {arr.includes(val) && <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" fill="none"/></svg>}
        </div>
        <div style={{fontSize:12,fontWeight:700}}>{label}</div>
      </div>
      <div style={{fontSize:10,color:arr.includes(val)?c.brand:c.textSub,lineHeight:1.5,paddingLeft:24}}>{desc}</div>
    </button>
  );
  const rad = (sel, val, onClick, label, desc) => (
    <button onClick={onClick} style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1.5px solid "+(sel===val?c.brand:c.inputBorder),background:sel===val?c.brandLight:c.card,color:sel===val?c.brand:c.text,cursor:"pointer",textAlign:"left"}}>
      <div style={{fontSize:12,fontWeight:700}}>{label}</div>
      <div style={{fontSize:10,color:sel===val?c.brand:c.textSub,marginTop:2,lineHeight:1.5}}>{desc}</div>
    </button>
  );

  const totalSteps = structure === "ab" ? 3 : 2;
  const isLast = step === totalSteps;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflow:"auto"}}>
      <div style={{background:c.card,borderRadius:12,maxWidth:600,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid "+c.divider}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:c.text}}>견적서 생성 방식 선택</div>
            <div style={{fontSize:11,color:c.textSub}}>STEP {step} / {totalSteps}</div>
          </div>
          <div style={{fontSize:12,color:c.textSub,marginTop:3}}>상담 + 브리핑을 종합하여 AI가 초안을 만듭니다</div>
        </div>
        <div style={{padding:"20px 24px",display:"grid",gap:16,minHeight:200}}>
          {step === 1 && (
            <div>
              <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:10,textTransform:"uppercase"}}>제안 구조</div>
              <div style={{display:"flex",gap:8}}>
                {rad(structure, "single", () => setStructure("single"), "단일안 (A안)", "하나의 안으로 제시")}
                {rad(structure, "ab", () => setStructure("ab"), "A안 + B안", "업무 범위/개요가 다른 두 가지 안")}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:10,textTransform:"uppercase"}}>A안 내부 구성 <span style={{fontSize:10,color:c.textHint,fontWeight:400,marginLeft:6}}>(최소 1개, 최대 2개)</span></div>
              <div style={{display:"flex",gap:8}}>
                {chk(planAVariants, "ai_h", () => toggleVariant("A", "ai_h"), "AI+H", "AI Agent + 휴먼 · 기간 30% 단축")}
                {chk(planAVariants, "subscription", () => toggleVariant("A", "subscription"), "구독작업자", "휴먼 전용 · 표준 기간")}
              </div>
              <div style={{fontSize:10,color:c.textSub,marginTop:8}}>선택된 구성: {planAVariants.length}개</div>
            </div>
          )}
          {step === 3 && structure === "ab" && (
            <div>
              <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:10,textTransform:"uppercase"}}>B안 내부 구성 <span style={{fontSize:10,color:c.textHint,fontWeight:400,marginLeft:6}}>(최소 1개, 최대 2개)</span></div>
              <div style={{display:"flex",gap:8}}>
                {chk(planBVariants, "ai_h", () => toggleVariant("B", "ai_h"), "AI+H", "AI Agent + 휴먼 · 기간 30% 단축")}
                {chk(planBVariants, "subscription", () => toggleVariant("B", "subscription"), "구독작업자", "휴먼 전용 · 표준 기간")}
              </div>
              <div style={{fontSize:10,color:c.textSub,marginTop:8}}>선택된 구성: {planBVariants.length}개</div>
            </div>
          )}
          <div style={{padding:"10px 12px",background:c.bg2,borderRadius:6,fontSize:11,color:c.textSub,lineHeight:1.6}}>
            💡 각 구성은 독립된 팀 편성과 시간을 가집니다. 생성 후 시간 검토 단계에서 세부 조정할 수 있습니다.
          </div>
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid "+c.divider,display:"flex",justifyContent:"space-between",gap:10,background:c.bg}}>
          <Btn onClick={onCancel} variant="ghost" c={c}>취소</Btn>
          <div style={{display:"flex",gap:8}}>
            {step > 1 && <Btn onClick={() => setStep(s => s-1)} variant="ghost" c={c}>이전</Btn>}
            {!isLast && <Btn onClick={() => setStep(s => s+1)} c={c} disabled={!canProceed()}>다음</Btn>}
            {isLast && <Btn onClick={submit} c={c} disabled={!canProceed()}>AI로 생성 시작</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}

// 시간 검토 모달 — AI 생성 후 제안서 확정 전 variant별 팀 구성/시간 검토
// REQ-PROPOSAL-003: 직무/등급/주h/주최대h 풀 편집, 멤버 추가/삭제, 하네스 토글(AI+H 한정)
function HoursReviewModal({ proposal, onConfirm, onCancel, onRequestRevise }){
  const { c } = useTheme();
  const { rates } = useRates();
  const { categories } = useCategories();
  const [edited, setEdited] = useState(() => {
    try { return JSON.parse(JSON.stringify(proposal)); } catch(e){ return proposal; }
  });
  const [reasonOpen, setReasonOpen] = useState(false);
  const plansRaw = (edited && edited.plans) || [];
  const plans = plansRaw.length > 0 ? plansRaw : [{name:"A안", variants:[newVariant("subscription")]}];
  const [activePlan, setActivePlan] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const planIdx = Math.max(0, Math.min(activePlan, plans.length-1));
  const plan = plans[planIdx] || {name:"A안", variants:[]};
  const variants = plan.variants || [];
  const vIdx = Math.max(0, Math.min(activeVariant, variants.length-1));
  const variant = variants[vIdx] || newVariant("subscription");
  const variantIsAi = variant.mode === "ai_h";
  const config = (edited && edited.ai_config) || DEFAULT_AI_CONFIG;
  const HARNESS_INDICATOR = "#9B87C9"; // DS-COLOR-002 하네스 인디케이터

  function updateVariant(nv){
    const np = plans.slice();
    const nvs = (plan.variants||[]).slice();
    nvs[vIdx] = nv;
    np[planIdx] = {...plan, variants: nvs};
    setEdited({...edited, plans: np});
  }
  function updMember(mi, k, v){
    const mem = (variant.members||[]).slice();
    mem[mi] = withId({...mem[mi], [k]: v});
    updateVariant({...variant, members: mem});
  }
  // 직무 드롭다운: rates에 있는 직무 선택 시 카테고리·등급·시급 자동 채움
  function changeRole(mi, roleKey){
    const mem = (variant.members||[]).slice();
    const cur = mem[mi];
    if(roleKey === "__custom"){
      mem[mi] = withId({...cur, role_key:"__custom", role_custom: cur.role_custom || ""});
    } else if(roleKey === ""){
      mem[mi] = withId({...cur, role_key:"", role_custom:""});
    } else {
      const r = rates.find(x => x.role === roleKey);
      if(!r){ mem[mi] = withId({...cur, role_key: roleKey}); }
      else {
        const gradeToUse = r.grades.find(g => g.g === cur.grade) || r.grades[0];
        mem[mi] = withId({
          ...cur,
          role_key: roleKey,
          role_custom: "",
          category: r.category || cur.category || "other",
          grade: gradeToUse ? gradeToUse.g : "",
          rate: gradeToUse ? gradeToUse.r : cur.rate,
        });
      }
    }
    updateVariant({...variant, members: mem});
  }
  function changeGrade(mi, gradeVal){
    const mem = (variant.members||[]).slice();
    const cur = mem[mi];
    const r = cur.role_key && cur.role_key !== "__custom" ? rates.find(x => x.role === cur.role_key) : null;
    if(r){
      const g = r.grades.find(x => x.g === gradeVal);
      mem[mi] = withId({...cur, grade: gradeVal, ...(g ? {rate: g.r} : {})});
    } else {
      mem[mi] = withId({...cur, grade: gradeVal});
    }
    updateVariant({...variant, members: mem});
  }
  function toggleHarness(mi){
    const mem = (variant.members||[]).slice();
    const cur = mem[mi];
    mem[mi] = withId({...cur, is_harness: !cur.is_harness});
    updateVariant({...variant, members: mem});
  }
  function addMember(){
    const base = {name:"", required_skills:"", role_key:"", role_custom:"", grade:"", category:"dev",
      contract_type:"hourly", weekly_hours:40, max_hours:50, rate:0, is_harness:false};
    updateVariant({...variant, members: (variant.members||[]).concat([withId(base)])});
  }
  function delMember(mi){
    const mem = (variant.members||[]).filter((_, j) => j !== mi);
    // monthly_hours에서도 제거
    const oldId = (variant.members||[])[mi]?.id;
    const mh = {...(variant.monthly_hours||{})};
    if(oldId) delete mh[oldId];
    updateVariant({...variant, members: mem, monthly_hours: mh});
  }
  function updMonthlyHour(mid, monthKey, val){
    const mh = {...(variant.monthly_hours||{})};
    if(!mh[mid]) mh[mid] = {};
    else mh[mid] = {...mh[mid]};
    if(val === "" || val == null) delete mh[mid][monthKey];
    else mh[mid][monthKey] = Number(val);
    updateVariant({...variant, monthly_hours: mh});
  }
  function updMonths(v){
    const n = Math.max(0.25, Number(v) || 1);
    updateVariant({...variant, total_months: n});
  }
  // POL-PRICING-003: 멤버별 개별 투입 기간. 빈 값 → 총 기간 폴백.
  function updMemberMonths(mi, val){
    const mem = (variant.members||[]).slice();
    const cur = mem[mi];
    if(val === "" || val == null){
      const nm = {...cur}; delete nm.months; mem[mi] = withId(nm);
    } else {
      mem[mi] = withId({...cur, months: Math.max(0.25, Number(val))});
    }
    updateVariant({...variant, members: mem});
  }

  const iSt = {padding:"6px 8px",borderRadius:6,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none",width:"100%",boxSizing:"border-box"};
  const members = variant.members || [];
  const months = Math.max(1, Number(variant.total_months || 1));
  const monthCount = Math.ceil(months);
  const totals = calcVariantTotals(variant, config);
  const catLabel = (id) => { const cat = categories.find(x => x.id === id); return cat ? cat.label : id; };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflow:"auto"}}>
      <div style={{background:c.card,borderRadius:12,maxWidth:1080,width:"100%",maxHeight:"94vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid "+c.divider,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:c.text}}>📊 팀 구성 · 투입 시간 검토</div>
            <div style={{fontSize:12,color:c.textSub,marginTop:3}}>직무/등급/시간을 조정하고, 과부족 포지션은 추가·삭제하세요. 하네스 엔지니어는 시급 50% 적용. 각 직무는 총 투입 기간과 별개로 개별 기간을 가질 수 있습니다.</div>
          </div>
          <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:c.textSub}}>×</button>
        </div>
        <div style={{padding:"20px 24px"}}>
          {/* 플랜 탭 */}
          {plans.length > 1 && (
            <div style={{display:"flex",gap:4,borderBottom:"1px solid "+c.divider,marginBottom:12}}>
              {plans.map((p, pi) => (
                <button key={pi} onClick={() => { setActivePlan(pi); setActiveVariant(0); }} style={{padding:"7px 14px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:planIdx===pi?700:500,color:planIdx===pi?c.brand:c.textSub,borderBottom:planIdx===pi?"2px solid "+c.brand:"2px solid transparent",marginBottom:-1}}>
                  {p.name} <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,marginLeft:4,background:c.bg2,color:c.textSub,fontWeight:700}}>{(p.variants||[]).length}안</span>
                </button>
              ))}
            </div>
          )}
          {/* variant 탭 */}
          {variants.length > 1 && (
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {variants.map((v, vi) => {
                const isAi = v.mode === "ai_h";
                return (
                  <button key={vi} onClick={() => setActiveVariant(vi)} style={{padding:"6px 12px",borderRadius:6,border:"1.5px solid "+(vIdx===vi?c.brand:c.inputBorder),background:vIdx===vi?c.brandLight:c.card,color:vIdx===vi?c.brand:c.text,fontSize:12,fontWeight:vIdx===vi?700:500,cursor:"pointer"}}>
                    {vi+1}안 · {isAi?"AI+H":"구독작업자"}
                  </button>
                );
              })}
            </div>
          )}
          {/* 기간 설정 */}
          <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14,padding:"10px 14px",background:c.brandLight,borderRadius:8,border:"1px solid "+c.brand+"33"}}>
            <span style={{fontSize:12,fontWeight:700,color:c.brand}}>총 투입 기간</span>
            <input type="number" step="0.25" min="0.25" value={variant.total_months||1} onChange={e => updMonths(e.target.value)} style={{...iSt,width:80,textAlign:"center"}}/>
            <span style={{fontSize:12,color:c.text}}>개월</span>
            {totals.isAi && <span style={{fontSize:11,color:c.textSub,marginLeft:"auto"}}>AI+H 적용 시 실 기간: {totals.months}개월 (30% 단축)</span>}
          </div>

          {/* 멤버 카드 리스트 */}
          {members.length === 0 ? (
            <div style={{textAlign:"center",padding:"32px 0",color:c.textHint,fontSize:13,border:"1px dashed "+c.inputBorder,borderRadius:8,marginBottom:12}}>
              팀원이 없습니다. 아래 버튼으로 포지션을 추가하세요.
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
              {members.map((m, mi) => {
                const ct = m.contract_type || "hourly";
                const isCustom = !m.role_key || m.role_key === "__custom";
                const roleData = !isCustom ? rates.find(r => r.role === m.role_key) : null;
                const gradeOptions = roleData ? roleData.grades : [];
                const isH = !!m.is_harness;
                const baseRate = Number(m.rate||0);
                const eff = effectiveRate(m);
                const monthAmt = calcAmount(m);
                return (
                  <div key={m.id||mi} style={{padding:"12px 14px",borderRadius:8,border:"1px solid "+c.divider,borderLeft:isH?"3px solid "+HARNESS_INDICATOR:"1px solid "+c.divider,background:isH?c.brandLight+"33":c.bg}}>
                    {/* Row 1: 이름/뱃지 · 직무 · 등급 · 삭제 */}
                    <div style={{display:"grid",gridTemplateColumns:"1.1fr 1.2fr 1fr auto",gap:8,marginBottom:8,alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <input value={m.name||""} onChange={e => updMember(mi, "name", e.target.value)} placeholder="이름/포지션" style={iSt}/>
                        {isH && <span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:HARNESS_INDICATOR,color:"#fff",fontWeight:700,whiteSpace:"nowrap"}}>🔧 하네스</span>}
                      </div>
                      <select value={m.role_key || ""} onChange={e => changeRole(mi, e.target.value)} style={iSt}>
                        <option value="">-- 직무 선택 --</option>
                        {rates.map(r => <option key={r.role} value={r.role}>{r.role} ({catLabel(r.category)})</option>)}
                        <option value="__custom">+ 직접 입력</option>
                      </select>
                      {isCustom ? (
                        <input value={m.grade||""} onChange={e => updMember(mi, "grade", e.target.value)} placeholder="등급 (자유 입력)" style={iSt}/>
                      ) : (
                        <select value={m.grade || ""} onChange={e => changeGrade(mi, e.target.value)} style={iSt}>
                          <option value="">-- 등급 --</option>
                          {gradeOptions.map(g => <option key={g.g} value={g.g}>{g.g} ({g.r.toLocaleString()}원/h)</option>)}
                        </select>
                      )}
                      <button onClick={() => delMember(mi)} title="삭제" style={{background:"transparent",border:"1px solid "+c.inputBorder,borderRadius:6,cursor:"pointer",color:"#FA5252",fontSize:14,padding:"5px 10px",fontWeight:700}}>×</button>
                    </div>
                    {/* Row 2: 자유 입력 직무명 (자유 직무일 때만) */}
                    {isCustom && (
                      <div style={{marginBottom:8}}>
                        <input value={m.role_custom||""} onChange={e => updMember(mi, "role_custom", e.target.value)} placeholder="직무명 직접 입력" style={iSt}/>
                      </div>
                    )}
                    {/* Row 3: 시급 / 주h / 주 최대h / 투입기간 / 계약 / 하네스 토글 (AI+H 한정) */}
                    <div style={{display:"grid",gridTemplateColumns: variantIsAi ? "1fr 0.7fr 0.7fr 0.8fr 0.95fr auto" : "1.1fr 0.8fr 0.8fr 0.85fr 1fr",gap:8,alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:9,fontWeight:700,color:c.textSub,marginBottom:3,textTransform:"uppercase"}}>시급(원)</div>
                        <input type="number" value={baseRate} onChange={e => updMember(mi, "rate", Number(e.target.value))} style={iSt}/>
                      </div>
                      <div>
                        <div style={{fontSize:9,fontWeight:700,color:c.textSub,marginBottom:3,textTransform:"uppercase"}}>주 h</div>
                        <input type="number" value={m.weekly_hours||""} onChange={e => updMember(mi, "weekly_hours", Number(e.target.value))} style={{...iSt,textAlign:"center"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:9,fontWeight:700,color:c.textSub,marginBottom:3,textTransform:"uppercase"}}>주 최대 h</div>
                        <input type="number" value={m.max_hours||""} onChange={e => updMember(mi, "max_hours", Number(e.target.value))} style={{...iSt,textAlign:"center"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:9,fontWeight:700,color:c.textSub,marginBottom:3,textTransform:"uppercase"}}>투입 기간 (개월)</div>
                        <input type="number" step="0.25" min="0.25" max={months} value={m.months != null ? m.months : ""} onChange={e => updMemberMonths(mi, e.target.value)} placeholder={String(months)} title={"비워두면 총 투입 기간("+months+"개월) 적용. 총 기간을 초과할 수 없음."} style={{...iSt,textAlign:"center"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:9,fontWeight:700,color:c.textSub,marginBottom:3,textTransform:"uppercase"}}>계약</div>
                        <select value={ct} onChange={e => updMember(mi, "contract_type", e.target.value)} style={iSt}>
                          {CONTRACT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      {variantIsAi && (
                        <div>
                          <div style={{fontSize:9,fontWeight:700,color:c.textSub,marginBottom:3,textTransform:"uppercase"}}>하네스</div>
                          <button onClick={() => toggleHarness(mi)} title={isH ? "끄면 일반 시급으로 복귀" : "켜면 시급 50% 적용"} style={{padding:"6px 10px",borderRadius:6,border:"1.5px solid "+(isH?HARNESS_INDICATOR:c.inputBorder),background:isH?HARNESS_INDICATOR:"transparent",color:isH?"#fff":c.textSub,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{isH?"ON":"OFF"}</button>
                        </div>
                      )}
                    </div>
                    {/* 하네스 적용 시급 안내 */}
                    {isH && (
                      <div style={{marginTop:6,fontSize:11,color:c.textSub,textAlign:"right"}}>
                        하네스 시급 적용: {baseRate.toLocaleString()}원 × 50% = <b style={{color:HARNESS_INDICATOR,fontWeight:800}}>{eff.toLocaleString()}원/h</b>
                      </div>
                    )}
                    {/* Row 5: 월별 투입 시간 (다개월 + hourly) — 멤버 개별 기간 기준 (POL-PRICING-003) */}
                    {(() => {
                      if(ct !== "hourly") return null;
                      const memMonths = Math.min(months, Math.max(0.25, Number(m.months || months)));
                      const memMonthCount = Math.ceil(memMonths);
                      if(memMonthCount <= 1) return null;
                      return (
                        <div style={{marginTop:8,padding:"8px 10px",borderRadius:6,background:c.brandLight+"66",border:"1px dashed "+c.brand+"44"}}>
                          <div style={{fontSize:9,fontWeight:700,color:c.brand,marginBottom:6,textTransform:"uppercase"}}>월별 투입 시간 (미입력 시 주 h × 4) · {memMonths}개월</div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat("+Math.min(memMonthCount,6)+", 1fr)",gap:6}}>
                            {Array.from({length: Math.min(memMonthCount,6)}, (_, mIdx) => {
                              const monthKey = String(mIdx+1);
                              const mh = (variant.monthly_hours||{})[m.id] || {};
                              const val = mh[monthKey];
                              const defaultH = Number(m.weekly_hours||0) * 4;
                              return (
                                <div key={mIdx}>
                                  <div style={{fontSize:9,color:c.textSub,marginBottom:2,textAlign:"center"}}>{mIdx+1}월</div>
                                  <input type="number" value={val != null ? val : ""} onChange={e => updMonthlyHour(m.id, monthKey, e.target.value)} placeholder={String(defaultH)} style={{...iSt,padding:"5px 4px",textAlign:"center"}}/>
                                </div>
                              );
                            })}
                          </div>
                          {memMonthCount > 6 && <div style={{fontSize:10,color:c.textSub,marginTop:4}}>※ 7개월 이후는 편집 화면에서 입력</div>}
                        </div>
                      );
                    })()}
                    {/* Row 6: 1개월 환산 금액 + 멤버 기간 합계 (POL-PRICING-003) */}
                    {(() => {
                      const memMonths = Math.min(months, Math.max(0.25, Number(m.months || months)));
                      const isPartial = m.months != null && memMonths !== months;
                      const periodTotal = ct === "short_term" ? Number(m.total_amount||0) * (m.is_harness ? 0.5 : 1) : Math.round(monthAmt * memMonths);
                      return (
                        <div style={{marginTop:8,fontSize:11,color:c.textSub,textAlign:"right"}}>
                          1개월 환산 <b style={{color:c.text,fontSize:12,fontWeight:700}}>{monthAmt.toLocaleString()}원</b>
                          {isPartial && ct !== "short_term" && (
                            <span style={{marginLeft:10,color:c.brand}}>· {memMonths}개월 합계 <b style={{fontWeight:700}}>{periodTotal.toLocaleString()}원</b></span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}

          {/* 추가 버튼 */}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <button onClick={addMember} style={{padding:"8px 14px",borderRadius:6,border:"1.5px solid "+c.brand,background:"transparent",color:c.brand,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 포지션 추가</button>
            {variantIsAi && <span style={{fontSize:11,color:c.textSub,alignSelf:"center"}}>※ 하네스로 만들려면 추가 후 멤버 행의 하네스 토글을 ON</span>}
          </div>

          {/* 총 금액 요약 */}
          <div style={{padding:"16px 18px",background:c.bg2,borderRadius:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:c.text}}>월 공급가</div>
                <div style={{fontSize:11,color:c.textSub,marginTop:2}}>{variantIsAi ? "AI+H 적용 (기간 30% 단축, 일반 멤버 0.7 / 하네스 1.0)" : "구독작업자"}</div>
              </div>
              <div style={{fontSize:22,fontWeight:900,color:c.brand}}>{totals.avgMonthly.toLocaleString()}원 / 월</div>
            </div>
            {variantIsAi && totals.harnessTotal > 0 && (
              <div style={{padding:"8px 12px",background:HARNESS_INDICATOR+"22",borderRadius:6,fontSize:11,color:c.text,marginBottom:8,display:"flex",justifyContent:"space-between"}}>
                <span>일반 멤버 합계 × 0.7</span>
                <span style={{fontWeight:700}}>{Math.round(totals.normalTotal * 0.7).toLocaleString()}원 + 하네스 {totals.harnessTotal.toLocaleString()}원</span>
              </div>
            )}
            <div style={{borderTop:"1px solid "+c.divider,paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}>
              <span style={{color:c.textSub}}>총 투입 기간 {totals.months}개월 · 기간 합계</span>
              <span style={{fontWeight:700,color:c.text,fontSize:14}}>{totals.teamTotal.toLocaleString()}원</span>
            </div>
            {totals.isAi && (
              <div style={{marginTop:8,padding:"8px 12px",background:c.brandLight,borderRadius:6,fontSize:11,color:c.brand,fontWeight:600}}>
                ※ AI Agent 토큰 비용 별도 (실비 정산, 월 상한 {totals.tokenCap.toLocaleString()}원)
              </div>
            )}
          </div>
        </div>
        <div style={{padding:"16px 24px",borderTop:"1px solid "+c.divider,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,background:c.bg,flexWrap:"wrap"}}>
          {onRequestRevise ? (
            <button onClick={() => setReasonOpen(true)} style={{padding:"9px 16px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:12,fontWeight:600,cursor:"pointer"}}>
              ↻ AI 제안으로 다시 보내기
            </button>
          ) : <span/>}
          <div style={{display:"flex",gap:10}}>
            <Btn onClick={onCancel} variant="ghost" c={c}>취소</Btn>
            <Btn onClick={() => onConfirm(edited)} c={c}>확정하고 견적서 생성</Btn>
          </div>
        </div>
      </div>
      {reasonOpen && <RevisionReasonDialog onSubmit={(reason) => { setReasonOpen(false); onRequestRevise && onRequestRevise(reason, edited); }} onCancel={() => setReasonOpen(false)}/>}
    </div>
  );
}

// 사유 입력 다이얼로그 — REQ-PROPOSAL-008
function RevisionReasonDialog({ onSubmit, onCancel }){
  const { c } = useTheme();
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const valid = trimmed.length >= 5;
  const iSt = {padding:"10px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:c.text,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",lineHeight:1.5};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:c.card,borderRadius:12,maxWidth:520,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid "+c.divider}}>
          <div style={{fontSize:15,fontWeight:700,color:c.text}}>↻ AI 제안으로 다시 보내기</div>
          <div style={{fontSize:12,color:c.textSub,marginTop:4,lineHeight:1.5}}>현재 수정한 내용과 사유를 함께 AI에 전달합니다. 사유는 학습 패턴으로 누적되어 향후 제안에 반영됩니다.</div>
        </div>
        <div style={{padding:"16px 22px"}}>
          <div style={{fontSize:11,fontWeight:700,color:c.textSub,marginBottom:6,textTransform:"uppercase"}}>수정 사유 <span style={{color:"#FA5252"}}>*</span> (최소 5자)</div>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={5} placeholder="예: PM 비중을 줄이고 시니어 개발자 1명을 추가해주세요" style={iSt} autoFocus/>
          <div style={{fontSize:10,color:trimmed.length>0 && !valid ? "#FA5252" : c.textHint,marginTop:6}}>{trimmed.length}자 / 최소 5자</div>
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid "+c.divider,display:"flex",justifyContent:"flex-end",gap:8,background:c.bg}}>
          <Btn onClick={onCancel} variant="ghost" c={c}>취소</Btn>
          <Btn onClick={() => valid && onSubmit(trimmed)} c={c} disabled={!valid}>AI에 다시 요청</Btn>
        </div>
      </div>
    </div>
  );
}

function TeamBuildingDetail({ customer, onBack, onUpdate }){
  const { c } = useTheme();
  const { rates } = useRates();
  const { categories } = useCategories();
  const [mode, setMode] = useState("preview");
  const [activePlan, setActivePlan] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [proposal, setProposal] = useState(() => {
    if(!customer.proposal_data){
      return {...DEFAULT_PROPOSAL, rm_name: customer.rm_name||"", ai_config: {...DEFAULT_AI_CONFIG}};
    }
    // 마이그레이션: 기존 harness_config → ai_config
    return migrateProposal(customer.proposal_data);
  });
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackFiles, setFeedbackFiles] = useState([]);
  const [revising, setRevising] = useState(false);
  const [history, setHistory] = useState(customer.proposal_history || []);
  const [pendingProposal, setPendingProposal] = useState(null); // 시간 검토 대기
  const [pendingLabel, setPendingLabel] = useState("");
  const [modeDialog, setModeDialog] = useState(null); // null | {action:"generate"|"revise"}
  const plans = proposal.plans || [{name:"안 1", mode:"human", members:[]}];
  const hasProposal = !!(proposal.project_overview || (plans[0] && plans[0].members && plans[0].members.length > 0));

  // 모드 선택 → AI 생성 실행
  async function runGeneration(choice){
    // choice: { structure: "single"|"ab", plans: [{name, variants: [modeString]}] }
    const { structure, plans: planSpec } = choice;
    setModeDialog(null);
    setGenerating(true);
    try {
      const notes = await store.get("notes:"+customer.id, []);
      const notesText = notes.length > 0 ? notes.map(n => "["+n.title+"]\n"+(n.content||"")).join("\n\n---\n\n") : "상담 기록 없음";
      const briefing = customer.briefing || "";
      const catMap = {};
      categories.forEach(cat => { catMap[cat.id] = cat.label; });
      const rateInfo = rates.map(r => "- role_key=\""+r.role+"\" (카테고리: "+(catMap[r.category]||r.category||"기타")+"): "+r.grades.map(g => g.g+" → "+g.r.toLocaleString()+"원/h").join(", ")).join("\n");
      const categoryInfo = categories.map(cat => "- "+cat.id+" ("+cat.label+")"+(cat.desc?": "+cat.desc:"")).join("\n");
      const structureHint = structure === "single"
        ? "plans 배열에 A안 1개만 생성하세요."
        : "plans 배열에 A안과 B안 2개를 생성하세요. 두 안은 업무 범위/개요 방향이 서로 달라야 합니다.";
      const variantsHint = planSpec.map(p =>
        `- ${p.name}: variants 배열에 ${p.variants.length}개 생성, 각 구성의 mode는 순서대로 [${p.variants.join(", ")}] (ai_h=AI Agent+휴먼, subscription=휴먼 전용). 각 구성의 scope_of_work와 members는 서로 다를 수 있습니다.`
      ).join("\n");
      const userMsg = "고객: "+customer.company+"\n산업: "+(customer.industry||"")+"\n도메인: "+(customer.domain||"")+
        "\n\n[상담 기록]\n"+notesText+
        (briefing ? "\n\n[브리핑 최종본]\n"+briefing : "")+
        "\n\n[제안 구조]\n"+structureHint+"\n"+variantsHint;
      const patternsBlock = await buildRevisionPatternsBlock();
      const sys = PROPOSAL_SYSTEM + "\n\n## 사용 가능한 직무 카테고리\n"+categoryInfo+"\n\n## 사용 가능한 직무 목록 (role_key는 정확히 이 중에서 선택)\n"+rateInfo + patternsBlock;
      const raw = await callClaude(sys, userMsg, 4500);
      const mt = raw.match(/\{[\s\S]*\}/);
      if(!mt) throw new Error("JSON 파싱 실패");
      const parsed = JSON.parse(mt[0]);
      // variant.mode 강제 주입 (AI 응답 무시하고 사용자 선택 우선)
      parsed.plans = (parsed.plans || []).slice(0, planSpec.length).map((p, i) => {
        const spec = planSpec[i];
        const aiVariants = (p.variants || []).slice(0, spec.variants.length);
        // AI가 variant를 부족하게 보낸 경우 빈 것으로 채움
        while(aiVariants.length < spec.variants.length){
          aiVariants.push({scope_of_work:[], members:[], total_months:1});
        }
        return {
          name: p.name || spec.name,
          variants: aiVariants.map((v, vi) => ({
            mode: spec.variants[vi],
            label: v.label || "",
            scope_of_work: v.scope_of_work || [],
            total_months: Number(v.total_months || 1),
            monthly_hours: {},
            members: (v.members || []).map(mm => normalizeMember(mm, rates, categories)),
          })),
        };
      });
      // planSpec에는 있는데 AI가 안 보낸 plan은 비어있는 variant로 채움
      while(parsed.plans.length < planSpec.length){
        const spec = planSpec[parsed.plans.length];
        parsed.plans.push({
          name: spec.name,
          variants: spec.variants.map(m => newVariant(m)),
        });
      }
      parsed.ai_config = proposal.ai_config || {...DEFAULT_AI_CONFIG};
      parsed.monitoring_subscriptions = proposal.monitoring_subscriptions || [];
      setPendingProposal(parsed);
      setPendingLabel("AI 최초 생성");
    } catch(e){ alert("생성 오류: "+e.message); }
    setGenerating(false);
  }

  // 시간 검토 모달 → AI 재제안 (REQ-PROPOSAL-008): 사용자 사유와 편집된 proposal을 함께 전달
  async function reviseFromReview(reason, edited){
    setPendingProposal(null);
    setPendingLabel("");
    setGenerating(true);
    try {
      const rateInfo = rates.map(r => r.role+": "+r.grades.map(g => g.g+" "+g.r.toLocaleString()+"원").join(", ")).join("\n");
      const patternsBlock = await buildRevisionPatternsBlock();
      const sys = PROPOSAL_SYSTEM + "\n시급 테이블:\n" + rateInfo + patternsBlock;
      const userMsg = "사용자가 직접 수정한 결과:\n"+JSON.stringify(edited, null, 2)
        + "\n\n사용자 사유:\n" + reason
        + "\n\n위 방향을 반영해서 다시 제안하세요. 각 plan과 variant의 구조(이름, mode, 개수)는 유지하세요.";
      const raw = await callClaude(sys, userMsg, 4500);
      const mt = raw.match(/\{[\s\S]*\}/);
      if(!mt) throw new Error("JSON 파싱 실패");
      const parsed = JSON.parse(mt[0]);
      const origPlans = (edited && edited.plans) || proposal.plans || [];
      parsed.plans = (parsed.plans || []).map((p, i) => {
        const orig = origPlans[i];
        if(!orig) return p;
        const origVariants = orig.variants || [];
        return {
          name: p.name || orig.name,
          variants: (p.variants || []).map((v, vi) => {
            const origV = origVariants[vi] || {};
            return {
              mode: origV.mode || v.mode || "subscription",
              label: v.label || origV.label || "",
              scope_of_work: v.scope_of_work || [],
              total_months: Number(v.total_months || origV.total_months || 1),
              monthly_hours: origV.monthly_hours || {},
              members: mergeAiMembers(v.members || [], origV.members || [], rates, categories),
            };
          }),
        };
      });
      parsed.ai_config = (edited && edited.ai_config) || proposal.ai_config || {...DEFAULT_AI_CONFIG};
      parsed.monitoring_subscriptions = (edited && edited.monitoring_subscriptions) || proposal.monitoring_subscriptions || [];
      setPendingProposal(parsed);
      setPendingLabel("AI 재제안");
      // 패턴 학습 (병렬, 실패해도 흐름 영향 없음)
      addPattern(reason).catch(() => {});
    } catch(e){ alert("재제안 오류: "+e.message); }
    setGenerating(false);
  }

  // AI 수정 (기존 구조/mode 유지)
  async function revise(){
    if(!feedback.trim() && feedbackFiles.length === 0){ alert("수정 의견을 입력하거나 파일을 첨부해주세요"); return; }
    setRevising(true);
    try {
      const rateInfo = rates.map(r => r.role+": "+r.grades.map(g => g.g+" "+g.r.toLocaleString()+"원").join(", ")).join("\n");
      const userMsg = "기존 제안서:\n"+JSON.stringify(proposal, null, 2)+"\n\n수정 의견:\n"+(feedback||"(첨부 참고)")+"\n\n각 plan과 variant의 구조(이름, mode, 개수)는 유지하세요.";
      const raw = await callClaude(PROPOSAL_SYSTEM+"\n시급 테이블:\n"+rateInfo, userMsg, 4500, feedbackFiles);
      const mt = raw.match(/\{[\s\S]*\}/);
      if(!mt) throw new Error("JSON 파싱 실패");
      const parsed = JSON.parse(mt[0]);
      // 원본 구조 유지: mode 강제 덮어쓰기, 각 variant의 monthly_hours/total_months 유지
      const origPlans = proposal.plans || [];
      parsed.plans = (parsed.plans || []).map((p, i) => {
        const orig = origPlans[i];
        if(!orig) return p;
        const origVariants = orig.variants || [];
        return {
          name: p.name || orig.name,
          variants: (p.variants || []).map((v, vi) => {
            const origV = origVariants[vi] || {};
            return {
              mode: origV.mode || v.mode || "subscription",
              label: v.label || origV.label || "",
              scope_of_work: v.scope_of_work || [],
              total_months: Number(v.total_months || origV.total_months || 1),
              monthly_hours: origV.monthly_hours || {},
              members: mergeAiMembers(v.members || [], origV.members || [], rates, categories),
            };
          }),
        };
      });
      parsed.ai_config = proposal.ai_config || {...DEFAULT_AI_CONFIG};
      parsed.monitoring_subscriptions = proposal.monitoring_subscriptions || [];
      setPendingProposal(parsed);
      setPendingLabel((history.length+1)+"차 수정");
    } catch(e){ alert("수정 오류: "+e.message); }
    setRevising(false);
  }

  async function confirmPending(finalProposal){
    const label = pendingLabel;
    const fb = feedback.trim();
    const newEntry = {version: history.length+1, data: finalProposal, timestamp: new Date().toISOString(), label, ...(fb?{feedback:fb}:{})};
    const newHistory = history.concat([newEntry]);
    setProposal(finalProposal);
    setHistory(newHistory);
    setActivePlan(0);
    setFeedback("");
    setFeedbackFiles([]);
    setPendingProposal(null);
    setPendingLabel("");
    const updated = {...customer, proposal_data: finalProposal, proposal_history: newHistory};
    updated.status = autoStatus(updated);
    await onUpdate(updated);
    setMode("preview");
  }

  async function saveEdit(){
    const newEntry = {version: history.length+1, data: proposal, timestamp: new Date().toISOString(), label: "직접 수정"};
    const newHistory = history.concat([newEntry]);
    setHistory(newHistory);
    await onUpdate({...customer, proposal_data: proposal, proposal_history: newHistory});
    setMode("preview");
  }

  return (
    <div>
      {modeDialog && <ModeSelectDialog onConfirm={runGeneration} onCancel={() => setModeDialog(null)}/>}
      {pendingProposal && <HoursReviewModal proposal={pendingProposal} onConfirm={confirmPending} onCancel={() => { setPendingProposal(null); setPendingLabel(""); }} onRequestRevise={reviseFromReview}/>}
      <BackBtn onClick={onBack}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:c.text,marginBottom:4}}>{customer.company} 팀 빌딩 제안서</div>
          <div style={{fontSize:12,color:c.textSub}}>{customer.industry}{customer.domain?" / "+customer.domain:""}</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {hasProposal && (
            <>
              <div style={{display:"flex",borderRadius:8,border:"1px solid "+c.inputBorder,overflow:"hidden"}}>
                {[["preview","미리보기"],["edit","편집"]].map(item => (
                  <button key={item[0]} onClick={() => setMode(item[0])} style={{padding:"7px 16px",border:"none",background:mode===item[0]?c.brand:"transparent",color:mode===item[0]?"#fff":c.textSub,fontSize:12,fontWeight:600,cursor:"pointer"}}>{item[1]}</button>
                ))}
              </div>
              {mode === "edit" && <Btn onClick={saveEdit} c={c} style={{padding:"7px 14px",fontSize:12}}>저장</Btn>}
              <Btn onClick={() => exportProposal(proposal, customer.company, "pdf", activePlan, activeVariant)} variant="ghost" c={c} style={{padding:"7px 14px",fontSize:12}}>PDF (활성 탭)</Btn>
              <Btn onClick={() => exportProposal(proposal, customer.company, "doc", activePlan, activeVariant)} variant="secondary" c={c} style={{padding:"7px 14px",fontSize:12}}>DOCX (활성 탭)</Btn>
            </>
          )}
          <Btn onClick={() => setModeDialog({action:"generate"})} c={c} disabled={generating} variant={hasProposal?"secondary":"primary"} style={{padding:"7px 16px",fontSize:12}}>{generating ? "생성 중..." : (hasProposal?"AI 재생성":"AI로 생성")}</Btn>
        </div>
      </div>
      {!hasProposal && !generating && (
        <Card c={c} style={{textAlign:"center",padding:"56px 40px",marginBottom:16}}>
          <div style={{fontSize:40,marginBottom:16}}>📋</div>
          <div style={{fontSize:14,fontWeight:700,color:c.text,marginBottom:8}}>팀 빌딩 제안서</div>
          <div style={{fontSize:12,color:c.textSub,marginBottom:24}}>AI로 자동 생성하거나, 직접 작성할 수 있어요.</div>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <Btn onClick={() => setModeDialog({action:"generate"})} c={c} disabled={generating}>{generating?"생성 중...":"AI로 생성"}</Btn>
            <Btn onClick={() => { setProposal({...DEFAULT_PROPOSAL, rm_name: customer.rm_name||""}); setMode("edit"); }} variant="ghost" c={c}>직접 작성</Btn>
          </div>
        </Card>
      )}
      {generating && (
        <Card c={c} style={{marginBottom:14,padding:"16px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:28,height:28,borderRadius:"50%",border:"3px solid "+c.brandLight,borderTopColor:c.brand,animation:"spin 1s linear infinite"}}/>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:c.text}}>AI 제안서 생성 중...</div>
              <div style={{fontSize:11,color:c.textSub,marginTop:2}}>상담 기록을 분석하고 있어요</div>
            </div>
          </div>
        </Card>
      )}
      {hasProposal && !generating && (
        <>
          {mode === "preview" && plans.length > 1 && (
            <div style={{display:"flex",gap:4,borderBottom:"1px solid "+c.divider,marginBottom:14}}>
              {plans.map((p, pi) => (
                <button key={pi} onClick={() => { setActivePlan(pi); setActiveVariant(0); }} style={{padding:"8px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:activePlan===pi?700:500,color:activePlan===pi?c.brand:c.textSub,borderBottom:activePlan===pi?"2px solid "+c.brand:"2px solid transparent",marginBottom:-1}}>{p.name || ("안 "+(pi+1))}</button>
              ))}
            </div>
          )}
          {mode === "preview" && (() => {
            const curPlan = plans[Math.min(activePlan, plans.length-1)] || {variants:[]};
            const curVariants = curPlan.variants || [];
            return (
              <>
                {curVariants.length > 1 && (
                  <div style={{display:"flex",gap:6,marginBottom:12}}>
                    {curVariants.map((v, vi) => {
                      const isAi = v.mode === "ai_h";
                      const label = isAi ? "AI+H" : "구독작업자";
                      return (
                        <button key={vi} onClick={() => setActiveVariant(vi)} style={{padding:"6px 14px",borderRadius:6,border:"1.5px solid "+(activeVariant===vi?c.brand:c.inputBorder),background:activeVariant===vi?c.brandLight:"transparent",color:activeVariant===vi?c.brand:c.textSub,fontSize:12,fontWeight:activeVariant===vi?700:500,cursor:"pointer"}}>
                          {vi+1}안 · {label}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div style={{marginBottom:16}}><ProposalPreview data={proposal} planIdx={activePlan} variantIdx={activeVariant}/></div>
              </>
            );
          })()}
          {mode === "edit" && <Card c={c} style={{marginBottom:16}}><ProposalEditForm data={proposal} onChange={setProposal}/></Card>}
          <Card c={c} style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:c.text,marginBottom:4}}>AI 수정 의견</div>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="수정 의견을 입력하세요" rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none",resize:"vertical",marginBottom:10}}/>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <Btn onClick={revise} c={c} disabled={revising || !feedback.trim()} style={{padding:"7px 20px",fontSize:12}}>{revising ? "수정 중..." : "AI로 반영"}</Btn>
            </div>
          </Card>
          {history.length > 0 && (
            <Card c={c}>
              <div style={{fontSize:13,fontWeight:700,color:c.text,marginBottom:10}}>수정 이력 ({history.length}건)</div>
              {history.slice().reverse().map(entry => (
                <div key={entry.version} style={{padding:"8px 0",borderTop:"1px solid "+c.divider,fontSize:12,color:c.textSub}}>
                  <b style={{color:c.text}}>{entry.label}</b> · {entry.timestamp && entry.timestamp.slice(0, 16).replace("T", " ")}
                  {entry.feedback && <div style={{fontSize:11,marginTop:2}}>💬 {entry.feedback}</div>}
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ─── CONSULT NOTES ─── */
const ANALYSIS_SYSTEM = `당신은 상담 분석 에이전트입니다.
## 주요 키워드
핵심 키워드 5~7개

## 한줄 니즈 요약

## 고객의 실제 니즈

## 정제된 요구사항

## 누락 항목 & 추가 확인 필요

## 리스크`;

// REQ-CONSULTING-003: 맥락 이탈 감지
const DRIFT_CHECK_SYSTEM = `상담 맥락 분석 전문가입니다. 회의록이 현재 프로젝트 맥락에서 벗어나 다른 프로젝트나 업무 영역을 다루고 있는지 판단하세요.
JSON만 응답: {"isDrift":boolean,"reason":"판단 이유 한 줄","newTopic":"새 주제 요약 (이탈 시만, 없으면 null)"}`;

// REQ-CONSULTING-005: AI 내용 보충
const SUPPLEMENT_SYSTEM = `회의록 분석 내용 보완 에이전트입니다.
RM이 AI 분석 결과에서 잘못되었거나 보완이 필요하다고 지적한 부분을 수정하여, 수정된 완전한 분석 내용을 반환합니다.
- 지적된 부분만 정확하게 수정하고, 나머지는 원본 그대로 유지하세요.
- 수정된 전체 분석 마크다운만 반환하세요. 설명이나 전문/후문 없이 분석 내용만 반환합니다.`;

// REQ-CONSULTING-006: RFP 생성
const RFP_SYSTEM = `당신은 IT 프로젝트 RFP 작성 전문가입니다.
브리핑 데이터와 상담 노트를 분석해 RFP 초안을 JSON으로 생성합니다.

규칙:
1. 브리핑·노트에 명시된 것만 known_facts로 분류합니다.
2. 맥락으로 유추한 것은 source를 반드시 "추정"으로 표시합니다.
3. 중요하지만 확인되지 않은 것은 unknown_questions에 넣습니다.
4. goal_statement는 산출물(output)이 아닌 결과(outcome) 중심으로 씁니다.
5. must_have는 최대 5개, 진짜 필수만.
6. 모든 텍스트는 한국어. 응답은 JSON만 반환합니다.

{
  "problem_statement": "핵심 문제 한 문장",
  "problem_cases": ["사례"],
  "root_cause": "근본 원인",
  "goal_statement": "목표 (outcome 중심)",
  "current_state": "현재 상태",
  "target_state": "목표 상태",
  "scope_of_work": ["수행할 업무 항목 1", "수행할 업무 항목 2"],
  "out_of_scope": ["제외항목"],
  "known_facts": [{"content": "사실", "source": "브리핑 v1"}],
  "assumptions": [{"content": "추정", "source": "추정"}],
  "unknown_questions": ["확인 필요한 질문"],
  "must_have": [{"item": "필수항목", "reason": "이유"}],
  "should_have": [{"item": "희망항목", "priority": "상", "reason": "이유"}],
  "explicit_exclusions": [{"item": "제외항목", "reason": "이유"}],
  "timeline": "일정",
  "budget_range": "예산",
  "tech_constraints": "기술 제약",
  "org_constraints": "조직 제약",
  "stakeholders": [{"role": "역할", "name": "이름", "responsibility": "책임", "interest": "이익"}],
  "success_criteria": [{"metric": "지표", "target": "목표값", "measurement_method": "측정방법", "measurable": true}]
}`;

// REQ-PROJECT-002: 프로젝트 API 헬퍼
async function fetchProjects(customerId) {
  try {
    const res = await fetch(`/api/projects?customerId=${encodeURIComponent(customerId)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { return []; }
}
async function createProject(data) {
  const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("프로젝트 생성 실패");
  return await res.json();
}
async function updateProject(projectId, data) {
  const res = await fetch(`/api/projects/${projectId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("프로젝트 업데이트 실패");
  return await res.json();
}

// REQ-PROJECT-002: 새 프로젝트 생성 다이얼로그
function NewProjectDialog({ customer, c, onClose, onCreate }) {
  const [title, setTitle] = React.useState(customer.company + " 프로젝트");
  const [creating, setCreating] = React.useState(false);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:c.card,borderRadius:16,padding:28,width:400,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:16,fontWeight:800,color:c.text,marginBottom:16}}>새 프로젝트</div>
        <Inp label="프로젝트 이름" value={title} onChange={setTitle} c={c}/>
        <div style={{display:"flex",gap:8,marginTop:18}}>
          <Btn onClick={onClose} variant="ghost" c={c} style={{flex:1}}>취소</Btn>
          <Btn onClick={async () => { if(!title.trim()) return; setCreating(true); await onCreate(title.trim()); setCreating(false); }} c={c} style={{flex:2}} disabled={creating||!title.trim()}>{creating?"생성 중...":"생성"}</Btn>
        </div>
      </div>
    </div>
  );
}

// REQ-CONSULTING-003: 맥락 이탈 다이얼로그
function ContextDriftDialog({ driftInfo, project, customer, onClose, onSameConsult, onNewProject }) {
  const { c } = useTheme();
  const [step, setStep] = React.useState(1);
  const [sameCustomer, setSameCustomer] = React.useState(true);
  const [newTitle, setNewTitle] = React.useState(driftInfo.newTopic || project.title + " (분리)");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:c.card,borderRadius:16,padding:28,width:500,maxWidth:"92vw",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
        {step === 1 && (
          <>
            <div style={{fontSize:16,fontWeight:800,color:c.text,marginBottom:10}}>맥락 변화 감지</div>
            <div style={{fontSize:13,color:c.textSub,padding:"12px 14px",background:c.bg2,borderRadius:8,lineHeight:1.7,marginBottom:16}}>
              <b>감지 이유:</b> {driftInfo.reason}
              {driftInfo.newTopic && <div style={{marginTop:4}}><b>새 주제:</b> {driftInfo.newTopic}</div>}
            </div>
            <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:10}}>이 내용을 어떻게 처리할까요?</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
              <button onClick={() => setStep(2)} style={{padding:"14px 16px",borderRadius:10,border:"2px solid "+c.brand,background:c.brandLight,cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:c.brand}}>별도 프로젝트로 분리</div>
                <div style={{fontSize:11,color:c.textSub,marginTop:3}}>새 프로젝트를 만들어 이 내용을 따로 관리해요</div>
              </button>
              <button onClick={() => { onSameConsult(driftInfo.newTopic || driftInfo.reason); onClose(); }} style={{padding:"14px 16px",borderRadius:10,border:"1.5px solid "+c.divider,background:c.card,cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:c.text}}>같은 상담으로 유지</div>
                <div style={{fontSize:11,color:c.textSub,marginTop:3}}>현재 프로젝트에 포함하고 브리핑에 맥락 변화를 기록해요</div>
              </button>
            </div>
            <button onClick={onClose} style={{width:"100%",padding:"8px",border:"none",background:"none",cursor:"pointer",fontSize:12,color:c.textHint}}>닫기 (나중에 처리)</button>
          </>
        )}
        {step === 2 && (
          <>
            <div style={{fontSize:16,fontWeight:800,color:c.text,marginBottom:16}}>새 프로젝트 설정</div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:c.textSub,marginBottom:6}}>프로젝트 이름</div>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:c.text,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:12,fontWeight:600,color:c.textSub,marginBottom:8}}>고객사</div>
              <div style={{display:"flex",gap:8}}>
                {[true, false].map(same => (
                  <button key={same} onClick={() => setSameCustomer(same)} style={{flex:1,padding:"10px",borderRadius:8,border:"2px solid "+(sameCustomer===same?c.brand:c.divider),background:sameCustomer===same?c.brandLight:c.card,cursor:"pointer",fontSize:12,fontWeight:sameCustomer===same?700:500,color:sameCustomer===same?c.brand:c.text}}>
                    {same ? customer.company+" (기존)" : "신규 고객 등록"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={() => setStep(1)} variant="ghost" c={c} style={{flex:1}}>이전</Btn>
              <Btn onClick={() => { onNewProject({ title: newTitle.trim()||project.title, sameCustomer, customerId: customer.id }); onClose(); }} c={c} style={{flex:2}} disabled={!newTitle.trim()}>프로젝트 생성</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// REQ-PROJECT-002: 프로젝트 목록 화면
function ProjectList({ customer, projects, loading, c, onSelectProject, onCreateProject }) {
  if (loading) return <Loading/>;
  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:18,fontWeight:800,color:c.text}}>{customer.company}</div>
        <div style={{fontSize:13,color:c.textSub,marginTop:2}}>{customer.industry}{customer.domain?" / "+customer.domain:""}</div>
        <div style={{fontSize:12,color:c.textHint,marginTop:4}}>프로젝트 생성·관리는 고객관리에서 진행하세요</div>
      </div>
      {projects.length === 0 ? (
        <Card c={c} style={{textAlign:"center",padding:"36px 0"}}>
          <div style={{fontSize:32,marginBottom:10}}>📁</div>
          <div style={{fontSize:13,color:c.textHint}}>프로젝트가 없어요. 고객관리에서 프로젝트를 추가하세요.</div>
        </Card>
      ) : (
        <div style={{display:"grid",gap:10}}>
          {projects.map(proj => (
            <Card key={proj.id} c={c} style={{padding:"16px 20px",cursor:"pointer"}} onClick={() => onSelectProject(proj)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:c.text}}>{proj.title}</div>
                  <div style={{fontSize:12,color:c.textSub,marginTop:3}}>
                    {proj.rmId && <span>{proj.rmId} · </span>}
                    {proj.lastActionAt && <span>최근 활동 {String(proj.lastActionAt).slice(0,10)}</span>}
                    {proj.briefing && <span style={{marginLeft:8,color:"#37B24D",fontWeight:600}}>● 브리핑 완료</span>}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <Badge status={proj.status || "신규접수"}/>
                  <span style={{fontSize:16,color:c.textSub}}>›</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ConsultNotes({ projectId, customerId, projectTitle, onExtracted, onDriftNewProject, onContextChanged }){
  const { c } = useTheme();
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [nextAction, setNextAction] = useState("");
  const [fileMap, setFileMap] = useState({});
  const [driftInfo, setDriftInfo] = useState(null);
  const [supplementInput, setSupplementInput] = useState("");
  const [supplementLoading, setSupplementLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (projectId) {
        try {
          const res = await fetch(`/api/notes/project/${projectId}`);
          const data = res.ok ? await res.json() : [];
          const arr = Array.isArray(data) ? data : [];
          setNotes(arr);
          if (arr.length > 0) setActiveId(arr[0].id);
        } catch (e) { setNotes([]); }
      } else {
        const d = await store.get("notes:"+customerId, []);
        setNotes(d); if (d.length > 0) setActiveId(d[0].id);
      }
      setLoading(false);
    };
    load();
  }, [projectId, customerId]);

  useEffect(() => {
    if (!activeId) return;
    const n = notes.find(n => n.id === activeId);
    if (n) setNextAction(n.next_action || "");
    setExtractedInfo(null); setDriftInfo(null); setSupplementInput("");
  }, [activeId]);

  async function saveAll(u) {
    setNotes(u);
    if (projectId) {
      await fetch(`/api/notes/project/${projectId}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(u) });
    } else {
      await store.set("notes:"+customerId, u);
    }
  }
  function updNote(id, field, val){ setNotes(p => p.map(n => n.id === id ? {...n, [field]: val} : n)); }
  async function addTab(){
    const seq = notes.length + 1;
    const n = {id: String(Date.now()), seq, title: seq+"차 상담", date: todayDate, content: ""};
    await saveAll(notes.concat([n])); setActiveId(n.id);
  }
  async function processFiles(fl){
    const added = [];
    for (let i = 0; i < fl.length; i++){
      const file = fl[i];
      if (file.size > 10*1024*1024){ alert(file.name+": 최대 10MB"); continue; }
      let type = "text", mediaType = "", data = "";
      if (file.type === "application/pdf"){ type = "pdf"; data = await readFileAsBase64(file); }
      else if (file.type.startsWith("image/")){ type = "image"; mediaType = file.type; data = await readFileAsBase64(file); }
      else data = await readFileAsText(file);
      added.push({name: file.name, type, mediaType, data, size: file.size});
    }
    if (added.length > 0) setFileMap(p => ({...p, [activeId]: (p[activeId]||[]).concat(added)}));
  }
  async function analyzeNote(note){
    const atts = fileMap[note.id] || [];
    const hasText = note.content || note.summary || note.client_requests || note.concerns;
    if (!hasText && atts.length === 0){ alert("내용이 없습니다"); return; }
    setAnalyzing(true); setExtractedInfo(null); setDriftInfo(null); setSupplementInput("");
    try {
      const parts = [];
      if (note.summary) parts.push("한 줄 요약: "+note.summary);
      if (note.content) parts.push("논의 내용:\n"+note.content);
      if (note.client_requests) parts.push("고객 요청사항:\n"+note.client_requests);
      if (note.concerns) parts.push("우려·미결 사항:\n"+note.concerns);
      const userMsg = parts.length > 0 ? parts.join("\n\n") : "첨부 파일을 분석해주세요.";
      const analysisText = await callClaude(ANALYSIS_SYSTEM, userMsg, 2000, atts);
      const updated = notes.map(n => n.id === note.id ? {...n, analysis: analysisText} : n);
      await saveAll(updated);
      // 정보 추출
      const exText = await callClaude('회의록에서 고객 정보를 JSON으로 추출. {"domain":null,"industry":null,"budget":null,"team_composition":null,"has_decision_maker":null,"next_actions":null}', userMsg, 400, atts);
      try {
        const m = exText.match(/\{[\s\S]*\}/);
        if (m){
          const parsed = JSON.parse(m[0]);
          if (parsed.next_actions) setNextAction(parsed.next_actions);
          const keys = ["domain","industry","budget","team_composition","has_decision_maker"];
          const filtered = {};
          keys.forEach(k => { if (parsed[k] !== null && parsed[k] !== undefined && parsed[k] !== "") filtered[k] = parsed[k]; });
          if (Object.keys(filtered).length > 0) setExtractedInfo(filtered);
        }
      } catch(e){}
      // REQ-CONSULTING-003: 맥락 이탈 감지 (프로젝트 모드에서만)
      const driftContent = [note.summary, note.content].filter(Boolean).join("\n");
      if (projectId && driftContent) {
        try {
          const driftMsg = "현재 프로젝트: "+(projectTitle||"프로젝트")+"\n\n회의록:\n"+driftContent;
          const driftText = await callClaude(DRIFT_CHECK_SYSTEM, driftMsg, 300);
          const dm = driftText.match(/\{[\s\S]*\}/);
          if (dm){ const drift = JSON.parse(dm[0]); if (drift.isDrift) setDriftInfo(drift); }
        } catch(e){}
      }
    } catch(e){ alert("분석 오류: "+e.message); }
    setAnalyzing(false);
  }
  async function supplementAnalysis(){
    if (!supplementInput.trim() || !active?.analysis) return;
    setSupplementLoading(true);
    try {
      const userMsg = `원본 분석:\n${active.analysis}\n\n수정/보완 요청:\n${supplementInput}`;
      const corrected = await callClaude(SUPPLEMENT_SYSTEM, userMsg, 2000);
      const updated = notes.map(n => n.id === activeId ? {...n, analysis: corrected} : n);
      await saveAll(updated);
      setSupplementInput("");
    } catch(e){ alert("보충 오류: "+e.message); }
    setSupplementLoading(false);
  }

  const active = notes.find(n => n.id === activeId);
  const activeFiles = activeId ? (fileMap[activeId]||[]) : [];
  if (loading) return <Loading/>;
  const taStyle = {width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:c.text,outline:"none",resize:"vertical"};
  return (
    <div>
      {/* 맥락 이탈 다이얼로그 */}
      {driftInfo && active && (
        <ContextDriftDialog
          driftInfo={driftInfo}
          project={{id: projectId, title: projectTitle}}
          customer={{id: customerId}}
          onClose={() => setDriftInfo(null)}
          onSameConsult={(changeNote) => { if (onContextChanged) onContextChanged(changeNote); setDriftInfo(null); }}
          onNewProject={(data) => { if (onDriftNewProject) onDriftNewProject(data); setDriftInfo(null); }}
        />
      )}
      <div style={{display:"flex",alignItems:"center",gap:4,borderBottom:"1px solid "+c.divider,marginBottom:14}}>
        {notes.map(n => (
          <button key={n.id} onClick={() => setActiveId(n.id)} style={{padding:"8px 14px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:activeId===n.id?700:500,color:activeId===n.id?c.brand:c.textSub,borderBottom:activeId===n.id?"2px solid "+c.brand:"2px solid transparent",marginBottom:-1}}>{n.title}</button>
        ))}
        <button onClick={addTab} style={{padding:"8px 12px",border:"none",background:"none",cursor:"pointer",fontSize:18,color:c.brand}}>+</button>
      </div>
      {active ? (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
            <Inp label="상담 제목" value={active.title} onChange={v => updNote(active.id, "title", v)} c={c}/>
            <Inp label="상담 날짜" value={active.date} onChange={v => updNote(active.id, "date", v)} c={c}/>
            <div>
              <div style={{fontSize:12,color:c.textSub,marginBottom:7,fontWeight:600}}>유형</div>
              <select value={active.type||"미팅"} onChange={e => updNote(active.id, "type", e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:c.text,outline:"none"}}>
                {["미팅","전화","이메일","기타"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <Inp label="한 줄 요약" value={active.summary||""} onChange={v => updNote(active.id, "summary", v)} c={c}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>논의 내용</div>
            <textarea value={active.content||""} onChange={e => updNote(active.id, "content", e.target.value)} placeholder="회의록을 붙여넣으세요" rows={5} style={taStyle}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"#2F9E44",marginBottom:6}}>고객 요청사항</div>
              <textarea value={active.client_requests||""} onChange={e => updNote(active.id, "client_requests", e.target.value)} rows={3} placeholder="고객이 명시적으로 요청한 것" style={taStyle}/>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"#E67700",marginBottom:6}}>우려·미결 사항</div>
              <textarea value={active.concerns||""} onChange={e => updNote(active.id, "concerns", e.target.value)} rows={3} placeholder="고객의 우려 또는 미결된 사항" style={taStyle}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <input type="checkbox" id={"confirmed_"+active.id} checked={!!active.confirmed_by_client} onChange={e => updNote(active.id, "confirmed_by_client", e.target.checked)} style={{width:15,height:15,cursor:"pointer"}}/>
            <label htmlFor={"confirmed_"+active.id} style={{fontSize:12,color:c.textSub,cursor:"pointer"}}>고객이 내용을 확인함</label>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>첨부 파일</div>
            <div onClick={() => { const inp = document.createElement("input"); inp.type="file"; inp.multiple=true; inp.accept=".pdf,.txt,image/*"; inp.onchange=e=>processFiles(e.target.files); inp.click(); }}
              style={{padding:14,borderRadius:8,border:"2px dashed "+c.inputBorder,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:c.textSub,fontSize:12}}>
              📁 클릭해서 파일 첨부
            </div>
            {activeFiles.length > 0 && (
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                {activeFiles.map((f, i) => (
                  <span key={i} style={{padding:"4px 10px",borderRadius:8,background:c.bg2,border:"1px solid "+c.divider,fontSize:11,color:c.text}}>
                    📎 {f.name}
                    <button onClick={() => setFileMap(p => ({...p, [activeId]: (p[activeId]||[]).filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:c.textHint,marginLeft:4}}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginBottom:14}}>
            <Btn onClick={() => analyzeNote(active)} variant="secondary" c={c} style={{padding:"7px 16px",fontSize:12}} disabled={analyzing}>{analyzing?"분석 중...":"AI 분석"}</Btn>
            <Btn onClick={() => saveAll(notes)} c={c} style={{padding:"7px 18px",fontSize:12}}>저장</Btn>
          </div>
          {extractedInfo && (
            <div style={{marginBottom:12,padding:"12px 14px",background:c.brandLight,borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:700,color:c.brand,marginBottom:10}}>파악된 고객 정보 — 업데이트할까요?</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                {Object.entries(extractedInfo).map(([k, v]) => {
                  const labels = {domain:"도메인",industry:"산업군",budget:"예산",team_composition:"팀",has_decision_maker:"의사결정권자"};
                  return <div key={k} style={{padding:"3px 10px",borderRadius:6,background:c.card,border:"1px solid "+c.divider,fontSize:12}}><span style={{color:c.textSub}}>{labels[k]}: </span><b>{k==="has_decision_maker"?(v?"있음":"없음"):v}</b></div>;
                })}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={() => { if(onExtracted) onExtracted(extractedInfo); setExtractedInfo(null); }} c={c} style={{padding:"5px 14px",fontSize:11}}>반영</Btn>
                <Btn onClick={() => setExtractedInfo(null)} variant="ghost" c={c} style={{padding:"5px 12px",fontSize:11}}>무시</Btn>
              </div>
            </div>
          )}
          {active.analysis && (
            <div style={{marginBottom:12,borderRadius:8,border:"1px solid "+c.divider,overflow:"hidden"}}>
              <div style={{padding:"9px 14px",background:c.bg2,fontSize:12,fontWeight:700,color:c.text}}>AI 분석 결과</div>
              <div style={{padding:"12px 14px"}}><MdBlock text={active.analysis} c={c}/></div>
            </div>
          )}
          {/* REQ-CONSULTING-005: AI로 내용 보충하기 */}
          {active.analysis && (
            <div style={{marginBottom:12,borderRadius:8,border:"1px solid "+c.brand+"44",overflow:"hidden"}}>
              <div style={{padding:"9px 14px",background:c.brandLight,fontSize:12,fontWeight:700,color:c.brand}}>AI로 내용 보충하기</div>
              <div style={{padding:"12px 14px"}}>
                <div style={{fontSize:11,color:c.textSub,marginBottom:10}}>분석 내용 중 이상하거나 보완이 필요한 부분을 설명해주세요. AI가 해당 부분을 수정한 분석으로 업데이트합니다.</div>
                <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                  <textarea value={supplementInput} onChange={e => setSupplementInput(e.target.value)} rows={2} placeholder="예: 팀 규모 추정이 잘못된 것 같아요. 실제로는 5명이라고 했어요." style={{flex:1,padding:"9px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none",resize:"none"}}/>
                  <Btn onClick={supplementAnalysis} c={c} style={{padding:"9px 16px",fontSize:12,whiteSpace:"nowrap"}} disabled={supplementLoading||!supplementInput.trim()}>{supplementLoading?"보충 중...":"보충하기"}</Btn>
                </div>
              </div>
            </div>
          )}
          <div style={{padding:"14px 16px",background:c.brandLight,borderRadius:8}}>
            <div style={{fontSize:12,fontWeight:700,color:c.brand,marginBottom:8}}>다음 액션</div>
            <textarea value={nextAction} onChange={e => setNextAction(e.target.value)} placeholder="다음 액션" rows={3} style={{...taStyle,background:c.card}}/>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
              <Btn onClick={async () => { await saveAll(notes.map(n => n.id === activeId ? {...n, next_action: nextAction} : n)); }} c={c} style={{padding:"6px 16px",fontSize:12}}>저장</Btn>
            </div>
          </div>
        </div>
      ) : <div style={{textAlign:"center",padding:"28px 0",color:c.textHint,fontSize:13}}>+ 버튼으로 상담 노트를 추가하세요</div>}
    </div>
  );
}

/* ─── CUSTOMER DETAIL ─── */
function CustomerDetail({ customer: init, onBack, onUpdate, team, setTeam, onGoConsulting }){
  const { c } = useTheme();
  const [cu, setCu] = useState(() => { const s = autoStatus(init); return s !== init.status ? {...init, status: s} : init; });
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showNewProj, setShowNewProj] = useState(false);
  useEffect(() => {
    setProjectsLoading(true);
    fetchProjects(cu.id).then(list => { setProjects(list); setProjectsLoading(false); });
  }, [cu.id]);
  function upd(k, v){
    setCu(p => {
      const next = {...p, [k]: v};
      if(k !== "status"){ const a = autoStatus(next); if(STAGE_ORDER.indexOf(a) > STAGE_ORDER.indexOf(next.status)) next.status = a; }
      return next;
    });
  }
  async function save(){
    setSaving(true);
    const u = {...cu, last_action_at: new Date().toISOString()};
    setCu(u);
    await onUpdate(u);
    setSaving(false);
  }
  return (
    <div>
      <BackBtn onClick={onBack}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:c.text,marginBottom:4}}>{cu.company}</div>
          <div style={{fontSize:13,color:c.textSub}}>{cu.industry}{cu.domain?" / "+cu.domain:""} · 접수 {cu.created_at && cu.created_at.slice(0,10)}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={cu.status} onChange={e => upd("status", e.target.value)} style={{padding:"9px 14px",borderRadius:12,fontSize:12,border:"1.5px solid "+c.inputBorder,background:c.inputBg,color:c.text,outline:"none"}}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Badge status={cu.status}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card c={c}>
          <div style={{fontSize:14,fontWeight:700,color:c.text,marginBottom:16}}>기본 정보</div>
          <div style={{display:"grid",gap:14}}>
            <div>
              <div style={{fontSize:12,color:c.textSub,marginBottom:8,fontWeight:600}}>문의 유형</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:cu.inquiry_type==="작업자가 필요해요"?10:0}}>
                {["작업자가 필요해요","프로덕트를 만들고 싶어요"].map(t => <ChipBtn key={t} active={cu.inquiry_type===t} onClick={() => upd("inquiry_type", t)} label={t} c={c}/>)}
              </div>
              {cu.inquiry_type === "작업자가 필요해요" && (
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {WORKER_TYPES.map(w => <ChipBtn key={w} active={(cu.worker_types||[]).includes(w)} onClick={() => upd("worker_types", (cu.worker_types||[]).includes(w) ? (cu.worker_types||[]).filter(x => x !== w) : (cu.worker_types||[]).concat([w]))} label={w} c={c}/>)}
                </div>
              )}
            </div>
            <Inp label="회사명" value={cu.company} onChange={v => upd("company", v)} c={c} required/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Inp label="담당자 이름" value={cu.contact_name} onChange={v => upd("contact_name", v)} c={c} required/>
              <Inp label="담당자 직책" value={cu.contact_title} onChange={v => upd("contact_title", v)} c={c}/>
            </div>
            <Inp label="연락처" value={cu.phone} onChange={v => upd("phone", v)} c={c} required/>
            <Inp label="예산 (선택)" value={cu.budget} onChange={v => upd("budget", v)} c={c}/>
            <div>
              <div style={{fontSize:12,color:c.textSub,marginBottom:8,fontWeight:600}}>구현 디바이스</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {DEVICES.map(d => <ChipBtn key={d} active={(cu.devices||[]).includes(d)} onClick={() => upd("devices", (cu.devices||[]).includes(d) ? (cu.devices||[]).filter(x => x !== d) : (cu.devices||[]).concat([d]))} label={d} c={c}/>)}
              </div>
            </div>
          </div>
        </Card>
        <div style={{display:"grid",gap:16}}>
          <Card c={c}>
            <div style={{fontSize:14,fontWeight:700,color:c.text,marginBottom:16}}>추가 정보</div>
            <div style={{display:"grid",gap:14}}>
              <div>
                <div style={{fontSize:12,color:c.textSub,marginBottom:7,fontWeight:600}}>산업군 *</div>
                <select value={cu.industry||""} onChange={e => upd("industry", e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:cu.industry?c.text:c.textSub,outline:"none"}}>
                  <option value="">선택</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <Inp label="도메인" value={cu.domain} onChange={v => upd("domain", v)} c={c}/>
              <Inp label="현재 팀 구성" value={cu.team_composition} onChange={v => upd("team_composition", v)} c={c}/>
              <div>
                <div style={{fontSize:12,color:c.textSub,marginBottom:8,fontWeight:600}}>의사결정권자</div>
                <div style={{display:"flex",gap:8}}>
                  {[{v:true,l:"있음"},{v:false,l:"없음"}].map(b => <ChipBtn key={String(b.v)} active={cu.has_decision_maker===b.v} onClick={() => upd("has_decision_maker", b.v)} label={b.l} c={c}/>)}
                </div>
              </div>
              <RMSelector value={cu.rm_name||""} onChange={v => upd("rm_name", v)} team={team} setTeam={setTeam}/>
            </div>
          </Card>
          <Card c={c}>
            <div style={{fontSize:14,fontWeight:700,color:c.text,marginBottom:14}}>파이프라인</div>
            {(() => {
              const done = getCompletedStages(cu);
              return STATUSES.map(s => {
                const isDone = done.has(s);
                const canMark = s === "미팅완료" && !isDone && (done.has("RM배정") || done.has("브리핑완료"));
                return (
                  <div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:18,height:18,borderRadius:4,background:isDone?c.brand:c.inputBorder+"44",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {isDone && <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" fill="none"/></svg>}
                    </div>
                    <span style={{fontSize:12,color:isDone?c.text:c.textSub,fontWeight:isDone?600:400,flex:1}}>{s}</span>
                    {canMark && <button onClick={() => upd("status", "미팅완료")} style={{padding:"3px 10px",borderRadius:8,fontSize:11,border:"1.5px solid "+c.brand,background:c.brandLight,color:c.brand,fontWeight:600,cursor:"pointer"}}>완료</button>}
                  </div>
                );
              });
            })()}
          </Card>
        </div>
      </div>
      <Card c={c} style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:c.text}}>프로젝트</div>
          <Btn onClick={() => setShowNewProj(true)} c={c} style={{padding:"5px 14px",fontSize:12}}>+ 새 프로젝트</Btn>
        </div>
        {projectsLoading ? <Loading/> : projects.length === 0 ? (
          <div style={{textAlign:"center",padding:"16px 0",color:c.textHint,fontSize:13}}>프로젝트가 없어요</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {projects.map(proj => (
              <div key={proj.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderRadius:8,border:"1px solid "+c.divider,background:c.bg2}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:c.text}}>{proj.title}</div>
                  <div style={{fontSize:11,color:c.textSub,marginTop:2}}>{proj.status}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <Badge status={proj.status}/>
                  {onGoConsulting && (
                    <Btn onClick={() => onGoConsulting(cu, proj)} c={c} style={{padding:"5px 12px",fontSize:11}}>상담 시작</Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {showNewProj && (
          <NewProjectDialog customer={cu} c={c} onClose={() => setShowNewProj(false)} onCreate={async (title) => {
            const proj = await createProject({ customerId: cu.id, title, rmId: cu.rm_name||null, status: cu.status||"신규접수" });
            setProjects(prev => [...prev, proj]); setShowNewProj(false);
          }}/>
        )}
      </Card>
      <Card c={c}>
        <div style={{fontSize:14,fontWeight:700,color:c.text,marginBottom:12}}>메모</div>
        <textarea value={cu.memo||""} onChange={e => upd("memo", e.target.value)} placeholder="메모" rows={3} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:c.text,outline:"none",resize:"vertical"}}/>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><Btn onClick={save} c={c}>{saving?"저장 중...":"저장"}</Btn></div>
      </Card>
    </div>
  );
}

function NewCustomerForm({ onClose, onAdd, team, setTeam }){
  const { c } = useTheme();
  const [f, setF] = useState({inquiry_type:"",worker_types:[],company:"",contact_name:"",contact_title:"",phone:"",budget:"",devices:[],industry:"",domain:"",team_composition:"",has_decision_maker:null,rm_name:""});
  const [err, setErr] = useState("");
  const set = (k, v) => setF(p => ({...p, [k]: v}));
  function submit(){
    if(!f.company || !f.contact_name || !f.phone || !f.industry){ setErr("회사명, 담당자, 연락처, 산업군은 필수예요"); return; }
    onAdd({...f, id: String(Date.now()), status: f.rm_name ? "RM배정" : "신규접수", created_at: new Date().toISOString(), last_action_at: new Date().toISOString()});
    onClose();
  }
  return (
    <Card c={c}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div style={{fontSize:18,fontWeight:800,color:c.text}}>신규 고객 접수</div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:c.textSub}}>×</button>
      </div>
      {err && <div style={{padding:"12px 14px",borderRadius:12,background:"rgba(250,82,82,0.08)",color:"#FA5252",fontSize:12,marginBottom:14}}>{err}</div>}
      <div style={{display:"grid",gap:14}}>
        <div>
          <div style={{fontSize:12,color:c.textSub,marginBottom:8,fontWeight:600}}>문의 유형 *</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:f.inquiry_type==="작업자가 필요해요"?10:0}}>
            {["작업자가 필요해요","프로덕트를 만들고 싶어요"].map(t => <ChipBtn key={t} active={f.inquiry_type===t} onClick={() => set("inquiry_type", t)} label={t} c={c}/>)}
          </div>
          {f.inquiry_type === "작업자가 필요해요" && (
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {WORKER_TYPES.map(w => <ChipBtn key={w} active={(f.worker_types||[]).includes(w)} onClick={() => set("worker_types", (f.worker_types||[]).includes(w) ? (f.worker_types||[]).filter(x => x !== w) : (f.worker_types||[]).concat([w]))} label={w} c={c}/>)}
            </div>
          )}
        </div>
        <Inp label="회사명" value={f.company} onChange={v => set("company", v)} c={c} required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="담당자 이름" value={f.contact_name} onChange={v => set("contact_name", v)} c={c} required/>
          <Inp label="담당자 직책" value={f.contact_title} onChange={v => set("contact_title", v)} c={c}/>
        </div>
        <Inp label="연락처" value={f.phone} onChange={v => set("phone", v)} c={c} required/>
        <Inp label="예산 (선택)" value={f.budget} onChange={v => set("budget", v)} c={c}/>
        <div>
          <div style={{fontSize:12,color:c.textSub,marginBottom:8,fontWeight:600}}>구현 디바이스</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {DEVICES.map(d => <ChipBtn key={d} active={f.devices.includes(d)} onClick={() => set("devices", f.devices.includes(d) ? f.devices.filter(x => x !== d) : f.devices.concat([d]))} label={d} c={c}/>)}
          </div>
        </div>
        <div>
          <div style={{fontSize:12,color:c.textSub,marginBottom:7,fontWeight:600}}>산업군 *</div>
          <select value={f.industry} onChange={e => set("industry", e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:f.industry?c.text:c.textSub,outline:"none"}}>
            <option value="">선택</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <Inp label="도메인" value={f.domain} onChange={v => set("domain", v)} c={c}/>
        <Inp label="현재 팀 구성" value={f.team_composition} onChange={v => set("team_composition", v)} c={c}/>
        <div>
          <div style={{fontSize:12,color:c.textSub,marginBottom:8,fontWeight:600}}>의사결정권자</div>
          <div style={{display:"flex",gap:8}}>
            {[{v:true,l:"있음"},{v:false,l:"없음"}].map(b => <ChipBtn key={String(b.v)} active={f.has_decision_maker===b.v} onClick={() => set("has_decision_maker", b.v)} label={b.l} c={c}/>)}
          </div>
        </div>
        <RMSelector value={f.rm_name} onChange={v => set("rm_name", v)} team={team} setTeam={setTeam}/>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8}}>
          <Btn onClick={onClose} variant="ghost" c={c}>취소</Btn>
          <Btn onClick={submit} c={c}>접수 등록</Btn>
        </div>
      </div>
    </Card>
  );
}

function Customers({ team, setTeam, user, onGoConsulting }){
  const { c } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("전체");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const KEY = "customers:"+user.id;
  useEffect(() => { loadCustomers(KEY).then(d => { setCustomers(d); setLoading(false); }); }, [user.id]);
  async function saveAll(list){ setCustomers(list); await store.set(KEY, list); }
  const list = filter === "전체" ? customers : customers.filter(cu => cu.status === filter);
  if(showForm) return <NewCustomerForm onClose={() => setShowForm(false)} onAdd={async cu => { await saveAll([cu].concat(customers)); setShowForm(false); }} team={team} setTeam={setTeam}/>;
  if(selected) return <CustomerDetail customer={selected} onBack={() => setSelected(null)} onUpdate={async u => { await saveAll(customers.map(cu => cu.id === u.id ? u : cu)); }} team={team} setTeam={setTeam} onGoConsulting={onGoConsulting}/>;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{fontSize:18,fontWeight:700,color:c.text}}>고객관리</div>
        <Btn onClick={() => setShowForm(true)} c={c}>+ 신규 접수</Btn>
      </div>
      <div style={{fontSize:13,color:c.textSub,marginBottom:20}}>접수된 고객 목록과 상태를 관리하세요</div>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["전체"].concat(STATUSES).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer",border:"1px solid "+(filter===s?c.brand:c.inputBorder),background:filter===s?c.brandLight:"transparent",color:filter===s?c.brand:c.textSub,fontWeight:filter===s?600:400}}>{s}</button>
        ))}
      </div>
      {loading ? <Loading/> : list.length === 0 ? <Card c={c}><div style={{textAlign:"center",padding:"32px 0",color:c.textHint}}>접수된 고객이 없어요</div></Card> : (
        <Card c={c} style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:"1px solid "+c.divider,background:c.bg2}}>
              {["회사명","담당자","산업/도메인","담당 RM","상태","접수일"].map(h => <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:600,color:c.textSub,textTransform:"uppercase"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map(cu => (
                <tr key={cu.id} onClick={() => setSelected(cu)} style={{borderBottom:"1px solid "+c.divider,cursor:"pointer"}} onMouseEnter={e => e.currentTarget.style.background = c.bg2} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{padding:"14px 16px",fontWeight:600,color:c.text}}>
                    {cu.company}
                  </td>
                  <td style={{padding:"14px 16px",color:c.textSub}}>{cu.contact_name}<br/><span style={{fontSize:11,color:c.textHint}}>{cu.contact_title}</span></td>
                  <td style={{padding:"14px 16px",color:c.textSub,fontSize:12}}>{cu.industry}{cu.domain && <><br/><span style={{fontSize:11,color:c.textHint}}>{cu.domain}</span></>}</td>
                  <td style={{padding:"14px 16px",color:cu.rm_name?c.text:c.textHint,fontSize:12}}>{cu.rm_name || "미배정"}</td>
                  <td style={{padding:"14px 16px"}}><Badge status={cu.status}/></td>
                  <td style={{padding:"14px 16px",color:c.textSub,fontSize:11}}>{cu.created_at && cu.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ─── BRIEFING ─── */

// 태그 입력 헬퍼 (must_have / should_have / out_of_scope)
function TagInput({ label, items, onChange, c, placeholder }) {
  const [input, setInput] = React.useState("");
  function addItem() {
    if (!input.trim()) return;
    onChange([...(items||[]), input.trim()]);
    setInput("");
  }
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:600,color:c.textSub,marginBottom:6}}>{label}</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
        {(items||[]).map(function(item, i) {
          return (
            <span key={i} style={{padding:"3px 10px",borderRadius:14,background:c.brandLight,border:"1px solid "+c.brand+"44",fontSize:12,color:c.brand,display:"flex",alignItems:"center",gap:5}}>
              {item}
              <button onClick={() => onChange((items||[]).filter(function(_,j){return j!==i;}))} style={{background:"none",border:"none",cursor:"pointer",color:c.brand,padding:0,fontSize:14,lineHeight:1}}>×</button>
            </span>
          );
        })}
      </div>
      <div style={{display:"flex",gap:6}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter"){e.preventDefault();addItem();} }} placeholder={placeholder||"항목 입력 후 Enter"} style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none"}}/>
        <button onClick={addItem} style={{padding:"8px 12px",borderRadius:8,border:"1.5px solid "+c.brand,background:c.brandLight,color:c.brand,fontSize:12,cursor:"pointer",fontWeight:600}}>추가</button>
      </div>
    </div>
  );
}

const STRUCTURED_SYSTEM = `당신은 IT 프로젝트 요구사항 분석 전문가입니다.
RM이 고객과 나눈 상담 노트와 고객 정보를 분석하여 요구사항을 정의합니다.

## 핵심 사고 원칙 (반드시 적용)

**1. 직접 관찰 vs 추정 구분**
- 고객이 상담에서 직접 언급한 것 → 그대로 기술
- 맥락으로 유추한 것 → 반드시 "(추정)" 접두어
- 아직 확인 안 된 것 → "(확인 필요)" 명시

**2. 증상 vs 원인 구분 (가장 중요)**
- 증상 예시: "업무가 비효율적이다", "데이터가 틀린다"
- 직접 원인: 왜 그 증상이 발생하는가
- 구조적 원인: 왜 이 문제가 생길 수밖에 없는 구조였는가
- project_background에는 증상이 아닌 원인을 써야 합니다

**3. 목표는 결과(outcome) 중심**
- 잘못된 예: "대시보드를 만든다" (산출물)
- 올바른 예: "현장 관리자가 실시간으로 재고 현황을 파악해 발주 오류가 0건이 된다" (결과)
- project_goal은 반드시 "고객 조직에서 달라지는 것"으로 기술

**4. must_have는 근본 원인에 대한 직접 응답**
- 증상을 해결하는 기능이 아니라, 원인을 제거하는 요건이어야 함
- 최대 5개 — 많으면 안 됩니다
- 각 항목: "무엇을 위해 왜 필요한가"가 한 문장에 담겨야 함

**5. out_of_scope는 이유와 함께**
- 단순 나열 금지. "이번에 제외한 이유"를 항목 뒤에 명시
- 형식: "항목명 — 제외 이유 (예: 다음 Phase / 고객이 직접 처리 / 예산 초과)"

**6. 이해관계자는 이해관계까지 분석**
- 각 이해관계자가 이 프로젝트로 이득/손해/중립인지 파악
- 손해를 보는 이해관계자가 있다면 반드시 명시

**7. known_unknowns — 비워두지 말 것**
- 고객이 모른다고 한 것, 아직 결정 안 된 것, 확인이 필요한 것
- 정보가 부족해도 "(확인 필요: 어떤 내용을 확인해야 하는가)"로 채울 것

모든 텍스트는 한국어로 작성합니다.
응답은 JSON만 반환합니다. 설명 텍스트 없이.

반환할 JSON 구조:
{
  "project_name": "프로젝트 명칭",
  "project_background": "문제 상황(증상 한 문장) + 직접 원인 + 구조적 원인(왜 이 구조에서 문제가 생길 수밖에 없었는가)을 4~6문장으로. 관찰 근거도 포함(직접 확인/보고/추정).",
  "project_goal": "이 프로젝트가 끝났을 때 고객 조직에서 달라져야 하는 것을 outcome 중심으로 3~5문장. 산출물 나열 금지. '누가 무엇을 할 수 있게 되는가'로 기술.",
  "must_have": ["근본 원인을 제거하기 위한 핵심 요건 — 왜 필요한지 포함, 최대 5개"],
  "should_have": ["있으면 목표 달성에 도움이 되는 것 — 없어도 핵심 문제는 해결됨을 전제로"],
  "out_of_scope": ["제외 항목 — 제외 이유 (다음 Phase / 고객이 직접 처리 / 예산 초과 등)"],
  "timeline": "기대하는 일정. 고객이 언급한 마감 또는 중간 마일스톤 포함",
  "budget_range": "예산 범위. 미정이면 '미정 (확인 필요)' 명시",
  "tech_constraints": "기술 제약사항. 기존 시스템 연동, 특정 플랫폼 강제 등. 없으면 '없음'",
  "decision_maker": "최종 의사결정권자 이름/직책. 모르면 '(확인 필요)'",
  "contact_person": "실무 담당자 이름/직책",
  "stakeholders": "이해관계자 목록. 형식: '직책/이름 — 이득/손해/중립, 이유'",
  "known_unknowns": "고객 스스로 모른다고 한 것 + RM이 아직 파악 못 한 것. 절대 비우지 말 것",
  "our_assumptions": "RM이 상담 맥락에서 추정하는 것. 확인 전까지는 가정임을 명시",
  "previous_attempts": "고객이 이미 시도했거나 검토한 솔루션/방법. 없으면 '없음 (확인 필요)'"
}`;

const BRIEFING_SYSTEM = `미팅 사전 브리핑 에이전트입니다.
## 한줄 니즈 요약
## 산업 구조 & 프로덕트 트렌드
## IT 팀 세팅 예시
## IT 주요 체크포인트
## 심층 질문셋
## RM 한줄 정리`;

function BriefingDetail({ project, customer, onBack, onUpdate }){
  const { c } = useTheme();
  const [generating, setGenerating] = useState(false);
  const [briefing, setBriefing] = useState(project?.briefing || null);
  const [history, setHistory] = useState(project?.briefing_history || []);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [rmMemo, setRmMemo] = useState(project?.rm_memo || "");
  const [copied, setCopied] = useState(false);
  const [showStructured, setShowStructured] = useState(false);
  const [savingStr, setSavingStr] = useState(false);
  const [str, setStr] = useState(function() {
    return project?.briefing_structured || {
      project_name: project?.title || "",
      project_background: "",
      project_goal: "",
      must_have: [],
      should_have: [],
      out_of_scope: [],
      timeline: "",
      budget_range: "",
      tech_constraints: "",
      decision_maker: customer?.contact_name || "",
      contact_person: "",
      stakeholders: "",
      known_unknowns: "",
      our_assumptions: "",
      previous_attempts: "",
    };
  });
  const [autoFilling, setAutoFilling] = useState(false);
  function updStr(k, v) { setStr(function(p) { return {...p, [k]: v}; }); }

  async function autoFill() {
    setAutoFilling(true);
    try {
      const notesRes = await fetch("/api/notes/project/"+project.id);
      const notes = notesRes.ok ? await notesRes.json() : [];
      const notesText = notes.length > 0 ? notes.map(function(n, idx) {
        var parts = ["["+(idx+1)+"차 "+(n.date||"")+"]"];
        if (n.type) parts.push("유형: "+n.type);
        if (n.summary) parts.push("요약: "+n.summary);
        if (n.content) parts.push("내용: "+n.content);
        if (n.client_requests) parts.push("고객 요청: "+n.client_requests);
        if (n.concerns) parts.push("우려사항: "+n.concerns);
        if (n.next_action) parts.push("다음 액션: "+n.next_action);
        return parts.join("\n");
      }).join("\n---\n") : "상담 기록 없음";
      var userMsg = "[고객 정보]\n회사: "+(customer.company||"")+"\n산업: "+(customer.industry||"")+"\n도메인: "+(customer.domain||"")+"\n프로젝트: "+project.title+"\n\n[상담 노트]\n"+notesText;
      var raw = await callClaude(STRUCTURED_SYSTEM, userMsg, 3000);
      var mt = raw.match(/\{[\s\S]*\}/);
      if (!mt) throw new Error("JSON 파싱 실패");
      var parsed = JSON.parse(mt[0]);
      setStr(function(prev) {
        return {
          project_name: parsed.project_name || prev.project_name,
          project_background: parsed.project_background || prev.project_background,
          project_goal: parsed.project_goal || prev.project_goal,
          must_have: Array.isArray(parsed.must_have) ? parsed.must_have : prev.must_have,
          should_have: Array.isArray(parsed.should_have) ? parsed.should_have : prev.should_have,
          out_of_scope: Array.isArray(parsed.out_of_scope) ? parsed.out_of_scope : prev.out_of_scope,
          timeline: parsed.timeline || prev.timeline,
          budget_range: parsed.budget_range || prev.budget_range,
          tech_constraints: parsed.tech_constraints || prev.tech_constraints,
          decision_maker: parsed.decision_maker || prev.decision_maker,
          contact_person: parsed.contact_person || prev.contact_person,
          stakeholders: parsed.stakeholders || prev.stakeholders,
          known_unknowns: parsed.known_unknowns || prev.known_unknowns,
          our_assumptions: parsed.our_assumptions || prev.our_assumptions,
          previous_attempts: parsed.previous_attempts || prev.previous_attempts,
        };
      });
    } catch(e) { alert("AI 자동 정리 오류: "+e.message); }
    setAutoFilling(false);
  }

  async function saveStructured() {
    setSavingStr(true);
    const updated = {...project, briefing_structured: str};
    const saved = await updateProject(project.id, updated);
    onUpdate(saved);
    setSavingStr(false);
  }

  async function generate(){
    setGenerating(true);
    try {
      // REQ-PROJECT-001: 프로젝트 노트 사용
      const notesRes = await fetch(`/api/notes/project/${project.id}`);
      const notes = notesRes.ok ? await notesRes.json() : [];
      const notesText = notes.length > 0 ? notes.map(function(n, idx) {
        var parts = ["["+(idx+1)+"차 "+n.date+"]"];
        if (n.summary) parts.push("요약: "+n.summary);
        if (n.content) parts.push(n.content);
        if (n.client_requests) parts.push("요청: "+n.client_requests);
        if (n.concerns) parts.push("우려: "+n.concerns);
        return parts.join("\n");
      }).join("\n---\n") : "상담 기록 없음";
      // REQ-CONSULTING-004: 맥락 변화 포함
      const prevEntry = history[history.length-1];
      const contextChanges = prevEntry?.context_changes?.map(ch => ch.note).join("; ") || "";
      // 구조화 브리핑 포함
      const strData = project.briefing_structured;
      const strBlock = strData ? "\n\n[요구사항 정리]\n"+JSON.stringify(strData, null, 2) : "";
      const userMsg = "회사: "+customer.company+"\n산업: "+(customer.industry||"")+"\n도메인: "+(customer.domain||"")+
        (contextChanges ? "\n\n[맥락 변화 기록]\n"+contextChanges : "")+strBlock+"\n\n상담:\n"+notesText;
      const text = await callClaude(BRIEFING_SYSTEM, userMsg, 3000);
      const newEntry = {version: history.length + 1, text, timestamp: new Date().toISOString(), noteCount: notes.length};
      const newHistory = [...history, newEntry];
      setHistory(newHistory);
      setBriefing(text); setViewingEntry(null);
      const updatedProject = {...project, briefing: text, briefing_history: newHistory};
      const saved = await updateProject(project.id, updatedProject);
      onUpdate(saved);
    } catch(e){ alert("브리핑 생성 오류: "+e.message); }
    setGenerating(false);
  }

  function copyText(text){
    try {
      const t = document.createElement("textarea");
      t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.focus(); t.select();
      document.execCommand("copy"); document.body.removeChild(t);
    } catch(e){}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayText = viewingEntry ? viewingEntry.text : briefing;
  const isViewingHistory = !!viewingEntry;

  return (
    <div>
      <BackBtn onClick={onBack}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:c.text,marginBottom:3}}>{project.title}</div>
          <div style={{fontSize:12,color:c.textSub}}>{customer.company} · {customer.industry}{customer.domain?" / "+customer.domain:""}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={() => setShowStructured(function(p){return !p;})} variant="ghost" c={c}>{showStructured?"요구사항 닫기":"요구사항 정리"}</Btn>
          <Btn onClick={generate} c={c} disabled={generating}>{generating ? "생성 중..." : (briefing ? "재생성" : "브리핑 생성")}</Btn>
        </div>
      </div>

      {showStructured && (
        <div style={{marginBottom:16,borderRadius:12,border:"1.5px solid "+c.brand+"44",overflow:"hidden"}}>
          <div style={{padding:"10px 16px",background:c.brandLight,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:c.brand}}>요구사항 정리</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {autoFilling && <span style={{fontSize:11,color:c.brand,fontWeight:600}}>AI 분석 중...</span>}
              <Btn onClick={autoFill} c={c} disabled={autoFilling} variant="ghost" style={{padding:"5px 14px",fontSize:12}}>AI 자동 정리</Btn>
              <Btn onClick={saveStructured} c={c} disabled={savingStr} style={{padding:"5px 14px",fontSize:12}}>{savingStr?"저장 중...":"저장"}</Btn>
            </div>
          </div>
          <div style={{padding:16}}>
            {/* 프로젝트 개요 */}
            <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>프로젝트 개요</div>
            <div style={{display:"grid",gap:10,marginBottom:16}}>
              <Inp label="프로젝트명" value={str.project_name||""} onChange={v => updStr("project_name",v)} c={c}/>
              <Inp label="배경 (왜 이 프로젝트를 하는가)" value={str.project_background||""} onChange={v => updStr("project_background",v)} c={c}/>
              <Inp label="목표 (프로젝트 후 달라져야 할 것)" value={str.project_goal||""} onChange={v => updStr("project_goal",v)} c={c}/>
            </div>
            {/* 요구사항 */}
            <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>요구사항</div>
            <div style={{marginBottom:16}}>
              <TagInput label="Must Have (반드시 필요)" items={str.must_have||[]} onChange={v => updStr("must_have",v)} c={c} placeholder="핵심 필수 항목 입력 후 Enter"/>
              <TagInput label="Should Have (있으면 좋음)" items={str.should_have||[]} onChange={v => updStr("should_have",v)} c={c} placeholder="희망 항목 입력 후 Enter"/>
              <TagInput label="Out of Scope (이번에 하지 않는 것)" items={str.out_of_scope||[]} onChange={v => updStr("out_of_scope",v)} c={c} placeholder="제외 항목 입력 후 Enter"/>
            </div>
            {/* 제약 조건 */}
            <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>제약 조건</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              <Inp label="기대 일정" value={str.timeline||""} onChange={v => updStr("timeline",v)} c={c}/>
              <Inp label="예산 범위" value={str.budget_range||""} onChange={v => updStr("budget_range",v)} c={c}/>
              <Inp label="기술 제약" value={str.tech_constraints||""} onChange={v => updStr("tech_constraints",v)} c={c}/>
            </div>
            {/* 이해관계자 */}
            <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>이해관계자</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <Inp label="최종 의사결정권자" value={str.decision_maker||""} onChange={v => updStr("decision_maker",v)} c={c}/>
              <Inp label="실무 담당자" value={str.contact_person||""} onChange={v => updStr("contact_person",v)} c={c}/>
              <Inp label="기타 이해관계자" value={str.stakeholders||""} onChange={v => updStr("stakeholders",v)} c={c}/>
            </div>
            {/* 불확실한 것 */}
            <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>불확실한 것</div>
            <div style={{display:"grid",gap:10}}>
              <Inp label="고객 스스로 모른다고 한 것" value={str.known_unknowns||""} onChange={v => updStr("known_unknowns",v)} c={c}/>
              <Inp label="RM 추정 (확인 필요)" value={str.our_assumptions||""} onChange={v => updStr("our_assumptions",v)} c={c}/>
              <Inp label="이미 시도한 것" value={str.previous_attempts||""} onChange={v => updStr("previous_attempts",v)} c={c}/>
            </div>
          </div>
        </div>
      )}
      {generating && (
        <Card c={c} style={{marginBottom:14,padding:"16px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:28,height:28,borderRadius:"50%",border:"3px solid "+c.brandLight,borderTopColor:c.brand,animation:"spin 1s linear infinite"}}/>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:c.text}}>AI 브리핑 생성 중...</div>
              <div style={{fontSize:11,color:c.textSub,marginTop:2}}>상담 기록을 분석하고 있어요</div>
            </div>
          </div>
        </Card>
      )}
      {!briefing && !generating && (
        <Card c={c} style={{marginBottom:14,padding:36,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>📋</div>
          <div style={{fontSize:13,color:c.text,marginBottom:4,fontWeight:600}}>미팅 브리핑을 생성하세요</div>
          <div style={{fontSize:11,color:c.textSub}}>상담 기록을 분석해 브리핑을 만들어드립니다.</div>
        </Card>
      )}
      {briefing && !generating && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:16,alignItems:"start",marginBottom:14}}>
          <Card c={c} style={{padding:"16px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:"1px solid "+c.divider}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {isViewingHistory ? (
                  <>
                    <div style={{width:7,height:7,borderRadius:2,background:"#FAB005"}}/>
                    <span style={{fontSize:12,fontWeight:700,color:c.text}}>{viewingEntry.version}차 브리핑 보는 중</span>
                    <span style={{fontSize:11,color:c.textSub}}>{viewingEntry.timestamp.slice(0,10)}</span>
                  </>
                ) : (
                  <>
                    <div style={{width:7,height:7,borderRadius:2,background:"#37B24D"}}/>
                    <span style={{fontSize:12,fontWeight:700,color:c.text}}>최신 브리핑</span>
                  </>
                )}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {isViewingHistory && (
                  <button onClick={() => setViewingEntry(null)} style={{fontSize:11,color:c.brand,background:c.brandLight,border:"none",borderRadius:5,padding:"3px 9px",cursor:"pointer",fontWeight:600}}>
                    최신으로
                  </button>
                )}
                <button onClick={() => copyText(displayText)} style={{fontSize:11,color:copied?c.brand:c.textSub,background:copied?c.brandLight:"none",border:"1px solid "+(copied?c.brand:c.divider),borderRadius:5,padding:"3px 9px",cursor:"pointer"}}>
                  {copied ? "복사됨 ✓" : "복사"}
                </button>
              </div>
            </div>
            <MdBlock text={displayText} c={c}/>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:12,fontWeight:600,color:c.textSub,padding:"0 2px 6px",borderBottom:"1px solid "+c.divider,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>브리핑 이력</span>
              <span style={{fontSize:11,color:c.brand,fontWeight:700}}>{history.length}건</span>
            </div>
            {history.length === 0 && (
              <div style={{fontSize:11,color:c.textHint,textAlign:"center",padding:"16px 0"}}>이력 없음</div>
            )}
            {[...history].reverse().map(entry => {
              const isLatest = entry.version === history.length;
              const isCurrent = !isViewingHistory && isLatest;
              const isSelected = isViewingHistory && viewingEntry.version === entry.version;
              return (
                <button key={entry.version} onClick={() => {
                  if(isLatest){ setViewingEntry(null); }
                  else { setViewingEntry(entry); }
                }}
                  style={{textAlign:"left",padding:"10px 12px",borderRadius:8,border:"1px solid "+(isCurrent||isSelected?c.brand:c.divider),background:isCurrent?c.brandLight:isSelected?c.brandLight+"88":c.card,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:isCurrent||isSelected?c.brand:c.text}}>
                      {entry.version}차 브리핑
                    </span>
                    {isCurrent && (
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:c.brand,color:"#fff",fontWeight:700,letterSpacing:"0.02em"}}>최신</span>
                    )}
                  </div>
                  <div style={{fontSize:10,color:c.textSub}}>
                    {entry.timestamp && entry.timestamp.slice(0,10).replace(/-/g,".")} {entry.timestamp && entry.timestamp.slice(11,16)}
                  </div>
                  {entry.noteCount !== undefined && (
                    <div style={{fontSize:10,color:c.textHint,marginTop:2}}>
                      상담 {entry.noteCount}건 기반
                    </div>
                  )}
                  {/* REQ-CONSULTING-004: 맥락 변화 표시 */}
                  {entry.context_changes && entry.context_changes.length > 0 && (
                    <div style={{fontSize:10,color:"#F08C00",marginTop:3}}>
                      맥락 변화 {entry.context_changes.length}건 기록됨
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <Card c={c}>
        <div style={{fontSize:13,fontWeight:700,color:c.text,marginBottom:8}}>RM 메모</div>
        <textarea value={rmMemo} onChange={e => setRmMemo(e.target.value)} rows={4} placeholder="미팅 전 개인 메모 (브리핑에 반영 안됨)" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.6}}/>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
          <Btn onClick={async () => { const saved = await updateProject(project.id, {...project, rm_memo: rmMemo}); onUpdate(saved); }} c={c} style={{padding:"7px 20px",fontSize:12}}>저장</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ─── CONSULTING ─── */
// REQ-CONSULTING-006: RFP 생성·편집 컴포넌트
function ConsultRfp({ project, customer, onBack, onUpdate }) {
  const { c } = useTheme();
  const [rfp, setRfp] = useState(project?.rfp || null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function generate() {
    setGenerating(true);
    try {
      const notesRes = await fetch("/api/notes/project/"+project.id);
      const notes = notesRes.ok ? await notesRes.json() : [];
      const notesJson = JSON.stringify(notes.map(function(n) {
        return { date: n.date, type: n.type, summary: n.summary, content: n.content, client_requests: n.client_requests, concerns: n.concerns };
      }));
      const strData = project.briefing_structured || {};
      const briefingJson = JSON.stringify(strData);
      const userMsg = "[브리핑 데이터]\n"+briefingJson+"\n\n[상담 노트]\n"+notesJson;
      const raw = await callClaude(RFP_SYSTEM, userMsg, 4000);
      const mt = raw.match(/\{[\s\S]*\}/);
      if (!mt) throw new Error("JSON 파싱 실패");
      const parsed = JSON.parse(mt[0]);
      setRfp(parsed);
      const updated = {...project, rfp: parsed};
      const saved = await updateProject(project.id, updated);
      onUpdate(saved);
    } catch(e) { alert("RFP 생성 오류: "+e.message); }
    setGenerating(false);
  }

  async function saveRfp(updated) {
    setSaving(true);
    setRfp(updated);
    const proj = {...project, rfp: updated};
    const saved = await updateProject(project.id, proj);
    onUpdate(saved);
    setSaving(false);
  }

  function updRfp(key, val) { setRfp(function(p) { return {...p, [key]: val}; }); }

  const sourceBadge = function(src) {
    if (!src) return null;
    var bg = src.includes("브리핑") ? "#1971C2" : src.includes("노트") ? "#2F9E44" : "#E67700";
    return <span style={{padding:"2px 7px",borderRadius:10,fontSize:10,fontWeight:700,color:"#fff",background:bg,marginLeft:6}}>{src}</span>;
  };

  const iSt = {width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none",boxSizing:"border-box"};
  const taSt = {...iSt, resize:"vertical"};

  return (
    <div>
      <BackBtn onClick={onBack}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:c.text,marginBottom:3}}>RFP</div>
          <div style={{fontSize:12,color:c.textSub}}>{project.title} · {customer.company}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {rfp && <Btn onClick={() => saveRfp(rfp)} c={c} disabled={saving} variant="ghost" style={{fontSize:12}}>{saving?"저장 중...":"저장"}</Btn>}
          <Btn onClick={generate} c={c} disabled={generating}>{generating?"생성 중...":(rfp?"재생성":"RFP 생성")}</Btn>
        </div>
      </div>

      {!rfp && !generating && (
        <div style={{padding:"48px 0",textAlign:"center",color:c.textHint}}>
          <div style={{fontSize:28,marginBottom:12}}>📄</div>
          <div style={{fontSize:14,fontWeight:600,color:c.text,marginBottom:6}}>RFP 초안을 생성하세요</div>
          <div style={{fontSize:12,color:c.textSub}}>요구사항 정리와 상담 노트를 바탕으로 AI가 RFP를 작성합니다</div>
        </div>
      )}
      {generating && <div style={{padding:"32px 0",textAlign:"center",color:c.textSub,fontSize:13}}>AI가 RFP를 작성 중입니다...</div>}

      {rfp && !generating && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* 문제/목표 */}
          <div style={{borderRadius:12,border:"1px solid "+c.divider,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",background:c.bg2,fontSize:12,fontWeight:700,color:c.text}}>문제 & 목표</div>
            <div style={{padding:16,display:"grid",gap:12}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:c.textSub,marginBottom:4}}>핵심 문제</div>
                <textarea value={rfp.problem_statement||""} onChange={e => updRfp("problem_statement",e.target.value)} rows={2} style={taSt}/>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:c.textSub,marginBottom:4}}>목표 (Outcome)</div>
                <textarea value={rfp.goal_statement||""} onChange={e => updRfp("goal_statement",e.target.value)} rows={2} style={taSt}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:c.textSub,marginBottom:4}}>현재 상태</div>
                  <textarea value={rfp.current_state||""} onChange={e => updRfp("current_state",e.target.value)} rows={2} style={taSt}/>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:c.textSub,marginBottom:4}}>목표 상태</div>
                  <textarea value={rfp.target_state||""} onChange={e => updRfp("target_state",e.target.value)} rows={2} style={taSt}/>
                </div>
              </div>
            </div>
          </div>

          {/* 업무 범위 */}
          <div style={{borderRadius:12,border:"1px solid "+c.divider,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",background:c.bg2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:700,color:c.text}}>업무 범위 (Scope of Work)</span>
              <button onClick={function(){ updRfp("scope_of_work",(rfp.scope_of_work||[]).concat([""])); }} style={{padding:"3px 10px",borderRadius:6,border:"1.5px solid "+c.brand,background:c.brandLight,color:c.brand,fontSize:11,fontWeight:600,cursor:"pointer"}}>+ 항목 추가</button>
            </div>
            <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:6}}>
              {(rfp.scope_of_work||[]).length === 0 && (
                <div style={{fontSize:12,color:c.textHint,textAlign:"center",padding:"8px 0"}}>항목을 추가하거나 RFP를 재생성하세요</div>
              )}
              {(rfp.scope_of_work||[]).map(function(item, i) {
                return (
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:13,color:c.textSub,minWidth:14}}>▸</span>
                    <input value={item} onChange={function(e){ var arr=[].concat(rfp.scope_of_work); arr[i]=e.target.value; updRfp("scope_of_work",arr); }} style={{...iSt,flex:1}}/>
                    <button onClick={function(){ updRfp("scope_of_work",(rfp.scope_of_work||[]).filter(function(_,j){return j!==i;})); }} style={{background:"none",border:"none",cursor:"pointer",color:c.textHint,fontSize:16}}>×</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 미확인 질문 — 강조 */}
          {rfp.unknown_questions && rfp.unknown_questions.length > 0 && (
            <div style={{borderRadius:12,border:"2px solid #E67700",overflow:"hidden",background:"rgba(230,119,0,0.04)"}}>
              <div style={{padding:"10px 16px",background:"rgba(230,119,0,0.1)",fontSize:12,fontWeight:700,color:"#E67700"}}>⚠ 고객에게 확인해야 할 미결 질문 ({rfp.unknown_questions.length}건)</div>
              <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:6}}>
                {rfp.unknown_questions.map(function(q, i) {
                  return (
                    <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <span style={{minWidth:18,height:18,borderRadius:9,background:"#E67700",color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>{i+1}</span>
                      <input value={q} onChange={function(e){ var arr=[].concat(rfp.unknown_questions); arr[i]=e.target.value; updRfp("unknown_questions",arr); }} style={{...iSt,flex:1}}/>
                      <button onClick={function(){ updRfp("unknown_questions",rfp.unknown_questions.filter(function(_,j){return j!==i;})); }} style={{background:"none",border:"none",cursor:"pointer",color:c.textHint,fontSize:16}}>×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 요구사항 */}
          <div style={{borderRadius:12,border:"1px solid "+c.divider,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",background:c.bg2,fontSize:12,fontWeight:700,color:c.text}}>요구사항</div>
            <div style={{padding:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"#1971C2",marginBottom:8}}>Must Have</div>
              {(rfp.must_have||[]).map(function(item, i) {
                return (
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                    <span style={{fontSize:11,color:c.textSub,minWidth:16}}>▸</span>
                    <input value={item.item||""} onChange={function(e){ var arr=rfp.must_have.map(function(x,j){return j===i?{...x,item:e.target.value}:x;}); updRfp("must_have",arr); }} placeholder="항목" style={{...iSt,flex:2}}/>
                    <input value={item.reason||""} onChange={function(e){ var arr=rfp.must_have.map(function(x,j){return j===i?{...x,reason:e.target.value}:x;}); updRfp("must_have",arr); }} placeholder="이유" style={{...iSt,flex:3}}/>
                  </div>
                );
              })}
              <div style={{fontSize:11,fontWeight:700,color:"#2F9E44",marginBottom:8,marginTop:14}}>Should Have</div>
              {(rfp.should_have||[]).map(function(item, i) {
                return (
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                    <span style={{fontSize:11,color:c.textSub,minWidth:16}}>▸</span>
                    <input value={item.item||""} onChange={function(e){ var arr=rfp.should_have.map(function(x,j){return j===i?{...x,item:e.target.value}:x;}); updRfp("should_have",arr); }} placeholder="항목" style={{...iSt,flex:2}}/>
                    <select value={item.priority||"중"} onChange={function(e){ var arr=rfp.should_have.map(function(x,j){return j===i?{...x,priority:e.target.value}:x;}); updRfp("should_have",arr); }} style={{padding:"9px 8px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none"}}>
                      {["상","중","하"].map(function(p){return <option key={p}>{p}</option>;})}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 알고 있는 것 / 추정 */}
          {((rfp.known_facts||[]).length>0 || (rfp.assumptions||[]).length>0) && (
            <div style={{borderRadius:12,border:"1px solid "+c.divider,overflow:"hidden"}}>
              <div style={{padding:"10px 16px",background:c.bg2,fontSize:12,fontWeight:700,color:c.text}}>알고 있는 것 & 추정</div>
              <div style={{padding:16}}>
                {(rfp.known_facts||[]).map(function(f, i) {
                  return <div key={i} style={{fontSize:12,color:c.text,marginBottom:6,display:"flex",alignItems:"center"}}>{sourceBadge(f.source)}<span style={{marginLeft:8}}>{f.content}</span></div>;
                })}
                {(rfp.assumptions||[]).map(function(f, i) {
                  return <div key={i} style={{fontSize:12,color:c.textSub,marginBottom:6,display:"flex",alignItems:"center"}}>{sourceBadge(f.source)}<span style={{marginLeft:8}}>{f.content}</span></div>;
                })}
              </div>
            </div>
          )}

          {/* 제약 조건 */}
          <div style={{borderRadius:12,border:"1px solid "+c.divider,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",background:c.bg2,fontSize:12,fontWeight:700,color:c.text}}>제약 조건</div>
            <div style={{padding:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["timeline","일정"],["budget_range","예산"],["tech_constraints","기술 제약"],["org_constraints","조직 제약"]].map(function(pair) {
                return (
                  <div key={pair[0]}>
                    <div style={{fontSize:11,fontWeight:600,color:c.textSub,marginBottom:4}}>{pair[1]}</div>
                    <textarea value={rfp[pair[0]]||""} onChange={function(e){ updRfp(pair[0],e.target.value); }} rows={2} style={taSt}/>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 성공 기준 */}
          {(rfp.success_criteria||[]).length>0 && (
            <div style={{borderRadius:12,border:"1px solid "+c.divider,overflow:"hidden"}}>
              <div style={{padding:"10px 16px",background:c.bg2,fontSize:12,fontWeight:700,color:c.text}}>성공 기준</div>
              <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {(rfp.success_criteria||[]).map(function(sc, i) {
                  return (
                    <div key={i} style={{padding:"10px 12px",borderRadius:8,background:c.bg2,border:"1px solid "+c.divider}}>
                      <div style={{fontSize:12,fontWeight:600,color:c.text,marginBottom:4}}>{sc.metric}</div>
                      <div style={{fontSize:11,color:c.textSub}}>목표: {sc.target} · 측정: {sc.measurement_method}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function Consulting({ user, initialTarget, onConsumeTarget }){
  const { c } = useTheme();
  const [tab, setTab] = useState("브리핑");
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const KEY = "customers:"+user.id;

  useEffect(() => { loadCustomers(KEY).then(d => { setCustomers(d); setLoading(false); }); }, [user.id]);

  useEffect(() => {
    if (initialTarget) {
      setSelected(initialTarget.customer);
      setSelectedProject(initialTarget.project);
      setProjects([initialTarget.project]);
      if (onConsumeTarget) onConsumeTarget();
    }
  }, [initialTarget]);

  async function updateCustomer(updated){
    const fresh = await store.get(KEY, []);
    const list = fresh.map(cu => cu.id === updated.id ? updated : cu);
    setCustomers(list); await store.set(KEY, list); setSelected(updated);
  }

  async function handleSelectCustomer(cu){
    setSelected(cu); setSelectedProject(null); setProjectsLoading(true);
    let list = await fetchProjects(cu.id);
    // REQ-PROJECT-002: 프로젝트 없으면 기존 고객 데이터로 자동 생성
    if (list.length === 0) {
      const defaultProj = await createProject({
        customerId: cu.id,
        title: cu.company + " 프로젝트",
        rmId: cu.rm_name || null,
        status: cu.status || "신규접수",
        briefing: cu.briefing || null,
        briefing_history: cu.briefing_history || [],
        proposal_data: cu.proposal_data || null,
        proposal_history: cu.proposal_history || [],
        rm_memo: cu.rm_memo || "",
      });
      list = [defaultProj];
    }
    setProjects(list); setProjectsLoading(false);
  }

  async function handleUpdateProject(updated){
    setSelectedProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  async function handleContextChanged(changeNote){
    if (!selectedProject) return;
    const h = [...(selectedProject.briefing_history || [])];
    if (h.length > 0) {
      const last = {...h[h.length-1]};
      last.context_changes = [...(last.context_changes||[]), {note: changeNote, at: new Date().toISOString()}];
      h[h.length-1] = last;
    }
    const saved = await updateProject(selectedProject.id, {...selectedProject, briefing_history: h});
    handleUpdateProject(saved);
  }

  async function handleDriftNewProject(data){
    if (data.sameCustomer) {
      const proj = await createProject({ customerId: data.customerId, title: data.title, rmId: selected?.rm_name||null, status: "신규접수" });
      setProjects(prev => [...prev, proj]);
      alert(`"${proj.title}" 프로젝트가 생성됐어요. 상담관리에서 선택할 수 있어요.`);
    } else {
      alert("신규 고객 등록은 고객관리 메뉴에서 진행해주세요.");
    }
  }

  const activeList = customers.filter(cu => !["계약성사","이탈"].includes(cu.status));

  // 프로젝트 선택 후 탭 콘텐츠
  if (selected && selectedProject) {
    if (tab === "브리핑") return <BriefingDetail project={selectedProject} customer={selected} onBack={() => setSelectedProject(null)} onUpdate={handleUpdateProject}/>;
    if (tab === "RFP") return <ConsultRfp project={selectedProject} customer={selected} onBack={() => setSelectedProject(null)} onUpdate={handleUpdateProject}/>;
    if (tab === "회의록분석") return (
      <div>
        <BackBtn onClick={() => setSelectedProject(null)}/>
        <div style={{fontSize:18,fontWeight:800,color:c.text,marginBottom:2}}>{selectedProject.title}</div>
        <div style={{fontSize:13,color:c.textSub,marginBottom:20}}>{selected.company}</div>
        <ConsultNotes
          projectId={selectedProject.id}
          customerId={selected.id}
          projectTitle={selectedProject.title}
          onExtracted={async info => { await updateCustomer({...selected, ...info}); }}
          onDriftNewProject={handleDriftNewProject}
          onContextChanged={handleContextChanged}
        />
      </div>
    );
    if (tab === "팀빌딩") return <TeamBuildingDetail customer={{...selected, ...selectedProject}} onBack={() => setSelectedProject(null)} onUpdate={async u => { await updateCustomer(u); }}/>;
  }

  // 고객 선택 후 프로젝트 목록
  if (selected && !selectedProject) {
    return (
      <div>
        <BackBtn onClick={() => { setSelected(null); setProjects([]); }}/>
        <ProjectList customer={selected} projects={projects} loading={projectsLoading} c={c} onSelectProject={setSelectedProject}/>
      </div>
    );
  }

  // 고객 목록
  return (
    <div>
      <div style={{fontSize:18,fontWeight:700,color:c.text,marginBottom:4}}>상담관리</div>
      <div style={{fontSize:13,color:c.textSub,marginBottom:20}}>AI 기반 상담 인텔리전스</div>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid "+c.divider,marginBottom:24}}>
        {["브리핑","회의록분석","RFP","팀빌딩"].map(t => (
          <button key={t} onClick={() => { setTab(t); setSelected(null); setSelectedProject(null); }} style={{padding:"8px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t?700:500,color:tab===t?c.brand:c.textSub,borderBottom:tab===t?"2px solid "+c.brand:"2px solid transparent",marginBottom:-1}}>{t}</button>
        ))}
      </div>
      {loading ? <Loading/> : activeList.length === 0 ? <Card c={c}><div style={{textAlign:"center",padding:"24px 0",color:c.textHint}}>진행 중인 고객이 없어요</div></Card> : (
        <div style={{display:"grid",gap:10}}>
          {activeList.map(cu => (
            <Card key={cu.id} c={c} style={{padding:"16px 20px"}} onClick={() => handleSelectCustomer(cu)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:c.text}}>{cu.company}</div>
                  <div style={{fontSize:12,color:c.textSub,marginTop:2}}>{cu.industry}{cu.domain?" / "+cu.domain:""} · {cu.rm_name||"RM 미배정"}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}><Badge status={cu.status}/><span style={{fontSize:16,color:c.textSub}}>›</span></div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── CONTRACT ─── */
function Contract({ user }){
  const { c } = useTheme();
  const [customers, setCustomers] = useState([]);
  const KEY = "customers:"+user.id;
  useEffect(() => { loadCustomers(KEY).then(d => setCustomers(d)); }, [user.id]);
  return (
    <div>
      <div style={{fontSize:18,fontWeight:700,color:c.text,marginBottom:4}}>계약관리</div>
      <div style={{fontSize:13,color:c.textSub,marginBottom:24}}>상담 파이프라인과 계약 현황</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
        {["신규접수","RM배정","브리핑완료","미팅완료","팀빌딩검토"].map(s => {
          const l = customers.filter(cu => cu.status === s);
          return (
            <div key={s}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><Badge status={s}/><span style={{fontSize:11,color:c.textSub,fontWeight:700}}>{l.length}</span></div>
              {l.map(cu => (
                <Card key={cu.id} c={c} style={{padding:"12px 14px",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:4}}>{cu.company}</div>
                  <div style={{fontSize:11,color:c.textSub}}>{cu.rm_name || "미배정"}</div>
                </Card>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {["계약성사","이탈"].map(s => {
          const l = customers.filter(cu => cu.status === s);
          return (
            <Card key={s} c={c}>
              <div style={{fontSize:14,fontWeight:700,color:c.text,marginBottom:12}}>{s} <span style={{fontSize:12,color:c.textSub}}>({l.length}건)</span></div>
              {l.length === 0 ? <div style={{fontSize:13,color:c.textHint,textAlign:"center",padding:"12px 0"}}>없음</div> :
                l.map(cu => (
                  <div key={cu.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:10,marginBottom:10,borderBottom:"1px solid "+c.divider}}>
                    <div><div style={{fontSize:13,fontWeight:600,color:c.text}}>{cu.company}</div><div style={{fontSize:11,color:c.textSub}}>{cu.created_at && cu.created_at.slice(0,10)}</div></div>
                    <Badge status={cu.status}/>
                  </div>
                ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ─── WORKERS (시급 관리) ─── */
function Workers(){
  const { c } = useTheme();
  const { rates, setRates } = useRates();
  const { categories } = useCategories();
  const [editRole, setEditRole] = useState(null);
  const [editGrades, setEditGrades] = useState([]);
  const [editCategory, setEditCategory] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCategory, setNewCategory] = useState("dev");
  const [showAddRole, setShowAddRole] = useState(false);

  function startEdit(role){
    const f = rates.find(r => r.role === role);
    setEditRole(role);
    setEditGrades(f ? f.grades.map(g => ({...g})) : []);
    setEditCategory(f ? (f.category || "other") : "other");
  }
  async function saveEdit(){
    const u = rates.map(r => r.role === editRole ? {...r, grades: editGrades, category: editCategory} : r);
    setRates(u);
    await store.set("rates", u);
    setEditRole(null);
  }
  async function deleteRole(role){
    const u = rates.filter(r => r.role !== role);
    setRates(u);
    await store.set("rates", u);
  }
  async function addRole(){
    if(!newRole.trim()) return;
    const u = rates.concat([{role: newRole.trim(), category: newCategory, grades: []}]);
    setRates(u);
    await store.set("rates", u);
    const addedRole = newRole.trim();
    setNewRole("");
    setNewCategory("dev");
    setShowAddRole(false);
    // 즉시 편집 모드 진입
    setEditRole(addedRole);
    setEditGrades([]);
    setEditCategory(newCategory);
  }
  function updGrade(oldG, field, val){
    setEditGrades(p => p.map(item => item.g === oldG ? {...item, [field]: field === "r" ? Number(val) : val} : item));
  }
  function addGrade(){
    const unused = GRADE_ORDER.find(g => !editGrades.find(e => e.g === g));
    if(unused) setEditGrades(p => p.concat([{g: unused, r: 0}]));
  }
  const iSt = {padding:"9px 11px",borderRadius:10,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none"};
  const catLabel = (id) => { const cc = categories.find(x => x.id === id); return cc ? cc.label : id; };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{fontSize:18,fontWeight:700,color:c.text}}>작업자관리</div>
        <Btn onClick={() => setShowAddRole(true)} c={c}>+ 직무 추가</Btn>
      </div>
      <div style={{fontSize:13,color:c.textSub,marginBottom:24}}>직무별 시급 테이블 (제안서 멤버 선택에 사용됨)</div>
      {showAddRole && (
        <Card c={c} style={{marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:700,color:c.text,marginBottom:12}}>새 직무 추가</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr auto auto",gap:8,alignItems:"flex-end"}}>
            <div>
              <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>직무명</div>
              <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="예: Data 엔지니어" style={{...iSt,width:"100%"}}/>
            </div>
            <div>
              <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>카테고리</div>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{...iSt,width:"100%"}}>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
            </div>
            <Btn onClick={addRole} c={c}>추가</Btn>
            <Btn onClick={() => setShowAddRole(false)} variant="ghost" c={c}>취소</Btn>
          </div>
          <div style={{fontSize:10,color:c.textHint,marginTop:8}}>추가 후 바로 등급별 시급 입력 화면으로 이동합니다.</div>
        </Card>
      )}
      {editRole && (
        <Card c={c} style={{marginBottom:16,border:"1.5px solid "+c.brand}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:c.brand}}>{editRole} 편집</div>
            <button onClick={() => setEditRole(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:c.textSub}}>×</button>
          </div>
          <div style={{marginBottom:14,padding:"10px 12px",background:c.bg2,borderRadius:8,display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:12,fontWeight:700,color:c.textSub}}>카테고리</div>
            <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{...iSt,flex:1,maxWidth:240}}>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
            <div style={{fontSize:10,color:c.textHint,marginLeft:"auto"}}>설정 &gt; 직무 관리에서 카테고리 추가/수정</div>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:c.textSub,marginBottom:8,textTransform:"uppercase"}}>등급별 시급</div>
          {editGrades.map(item => (
            <div key={item.g} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginBottom:8,alignItems:"center"}}>
              <select value={item.g} onChange={e => updGrade(item.g, "g", e.target.value)} style={iSt}>
                {GRADE_ORDER.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input type="number" value={item.r} onChange={e => updGrade(item.g, "r", e.target.value)} placeholder="시급(원)" style={iSt}/>
              <button onClick={() => setEditGrades(p => p.filter(e => e.g !== item.g))} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#FA5252"}}>×</button>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <button onClick={addGrade} style={{padding:"6px 14px",borderRadius:10,border:"1.5px solid "+c.brand,background:"transparent",color:c.brand,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ 등급 추가</button>
            <Btn onClick={saveEdit} c={c} style={{padding:"8px 22px"}}>저장</Btn>
          </div>
        </Card>
      )}
      <Card c={c} style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:"1px solid "+c.divider,background:c.bg2}}>
            <th style={{padding:"12px 16px",textAlign:"left",fontWeight:700,color:c.textSub,fontSize:10,textTransform:"uppercase"}}>직무</th>
            <th style={{padding:"12px 8px",textAlign:"left",fontWeight:700,color:c.textSub,fontSize:10,textTransform:"uppercase"}}>카테고리</th>
            {GRADE_ORDER.map(g => <th key={g} style={{padding:"12px 8px",textAlign:"center",fontWeight:700,color:c.textSub,fontSize:10,textTransform:"uppercase"}}>{g}</th>)}
            <th style={{width:110}}/>
          </tr></thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.role} style={{borderBottom:"1px solid "+c.divider}}>
                <td style={{padding:"12px 16px",fontWeight:600,color:c.text}}>{r.role}</td>
                <td style={{padding:"12px 8px"}}>
                  <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:c.brandLight,color:c.brand,fontWeight:700}}>{catLabel(r.category||"other")}</span>
                </td>
                {GRADE_ORDER.map(g => {
                  const f = r.grades.find(gr => gr.g === g);
                  return <td key={g} style={{padding:"12px 8px",textAlign:"center",color:f?c.text:c.textHint}}>{f ? f.r.toLocaleString()+"원" : "-"}</td>;
                })}
                <td style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={() => startEdit(r.role)} style={{padding:"4px 10px",borderRadius:8,border:"1px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:11,cursor:"pointer"}}>편집</button>
                    <button onClick={() => deleteRole(r.role)} style={{padding:"4px 10px",borderRadius:8,border:"1.5px solid rgba(238,93,80,0.35)",background:"transparent",color:"#FA5252",fontSize:11,cursor:"pointer"}}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─── DATA EXPORT PANEL ─── */
function DataExportPanel(){
  const { c } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  async function loadAll(){
    setLoading(true);
    try {
      const keys = await store.list("");
      const result = {};
      for(let i = 0; i < keys.length; i++){
        try {
          const r = await window.storage.get(keys[i]);
          if(r && r.value != null){
            try { result[keys[i]] = JSON.parse(r.value); } catch(e2){ result[keys[i]] = r.value; }
          }
        } catch(e3){}
      }
      setData(result);
    } catch(e){ alert("로드 오류: "+e.message); }
    setLoading(false);
  }

  async function doImport(replace){
    const text = importText.trim();
    if(!text){ alert("JSON을 입력해주세요"); return; }
    let parsed;
    try { parsed = JSON.parse(text); } catch(e){ alert("JSON 파싱 오류: "+e.message); return; }
    if(typeof parsed !== "object" || parsed === null || Array.isArray(parsed)){ alert("유효한 객체 JSON이 아닙니다"); return; }
    const keys = Object.keys(parsed);
    if(keys.length === 0){ alert("가져올 키가 없습니다"); return; }
    setImporting(true);
    setConfirmReplace(false);
    try {
      if(replace){
        const existing = await store.list("");
        for(const k of existing){
          try { await window.storage.delete(k); } catch(e){}
        }
      }
      for(const k of keys) await store.set(k, parsed[k]);
      setImportText("");
      setImportMode(false);
      alert(keys.length+"개 키를 가져왔습니다. 페이지를 새로고침하면 반영됩니다.");
      if(replace){
        setTimeout(() => { window.location.reload(); }, 500);
      } else {
        await loadAll();
      }
    } catch(e){ alert("가져오기 오류: "+e.message); }
    setImporting(false);
  }

  function copy(text){
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    } catch(e){}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const jsonText = data ? JSON.stringify(data, null, 2) : "";
  const canImport = !importing && !!importText.trim();

  return (
    <Card c={c}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:c.text,marginBottom:4}}>데이터 관리</div>
          <div style={{fontSize:12,color:c.textSub}}>백업을 위해 내보내거나 가져올 수 있어요</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={() => { setImportMode(p => !p); setConfirmReplace(false); }} variant={importMode ? "primary" : "secondary"} c={c}>📥 가져오기</Btn>
          <Btn onClick={loadAll} c={c} disabled={loading}>{loading ? "불러오는 중..." : "📤 내보내기"}</Btn>
        </div>
      </div>
      {importMode && (
        <div style={{marginBottom:18,padding:"14px 16px",background:c.brandLight,borderRadius:10,border:"1px solid "+c.brand+"33"}}>
          <div style={{fontSize:13,fontWeight:700,color:c.brand,marginBottom:6}}>📥 JSON 가져오기</div>
          <div style={{fontSize:11,color:c.textSub,marginBottom:10,lineHeight:1.6}}>
            <b>병합</b>: 기존 데이터 유지하고 추가 · <b>전체 교체</b>: 기존 데이터 전부 삭제 후 대체
          </div>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='{"customers:xxx":[...], "teams":[...], "rates":[...]}' rows={6}
            style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:11,color:c.text,outline:"none",resize:"vertical",fontFamily:"monospace",lineHeight:1.5}}/>
          {confirmReplace ? (
            <div style={{marginTop:10,padding:"12px 14px",borderRadius:8,background:"rgba(250,82,82,0.08)",border:"1px solid rgba(250,82,82,0.3)"}}>
              <div style={{fontSize:12,color:"#FA5252",fontWeight:700,marginBottom:8}}>⚠️ 기존 데이터가 모두 삭제되고 JSON 데이터로 대체됩니다.</div>
              <div style={{fontSize:11,color:c.textSub,marginBottom:10}}>이 동작은 되돌릴 수 없으며, 완료 후 페이지가 새로고침됩니다.</div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={() => setConfirmReplace(false)} disabled={importing} style={{padding:"7px 14px",borderRadius:8,border:"1px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:12,cursor:importing?"not-allowed":"pointer"}}>취소</button>
                <button onClick={() => doImport(true)} disabled={importing} style={{padding:"7px 16px",borderRadius:8,border:"none",background:"#FA5252",color:"#fff",fontSize:12,fontWeight:700,cursor:importing?"not-allowed":"pointer",opacity:importing?0.6:1}}>
                  {importing ? "처리 중..." : "정말 전체 교체"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:10}}>
              <button onClick={() => setImportText("")} disabled={importing||!importText} style={{padding:"7px 14px",borderRadius:8,border:"1px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:12,cursor:importText?"pointer":"not-allowed",opacity:importText?1:0.5}}>지우기</button>
              <button onClick={() => doImport(false)} disabled={!canImport} style={{padding:"7px 16px",borderRadius:8,border:"none",background:c.brand,color:"#fff",fontSize:12,fontWeight:700,cursor:canImport?"pointer":"not-allowed",opacity:canImport?1:0.5,boxShadow:"0 1px 2px rgba(0,0,0,0.08)"}}>
                {importing ? "처리 중..." : "병합 적용"}
              </button>
              <button onClick={() => setConfirmReplace(true)} disabled={!canImport}
                style={{padding:"7px 16px",borderRadius:8,border:"none",background:"#FA5252",color:"#fff",fontSize:12,fontWeight:600,cursor:canImport?"pointer":"not-allowed",opacity:canImport?1:0.5}}>
                전체 교체
              </button>
            </div>
          )}
        </div>
      )}
      {!data && !loading && (
        <div style={{textAlign:"center",padding:"48px 0",color:c.textHint}}>
          <div style={{fontSize:40,marginBottom:12}}>🗄️</div>
          <div style={{fontSize:13,fontWeight:500}}>내보내기 버튼으로 저장된 데이터를 불러오세요</div>
        </div>
      )}
      {data && (
        <div>
          <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
            <div style={{fontSize:12,color:c.textSub}}><b style={{color:c.brand}}>{Object.keys(data).length}</b>개 키</div>
            <button onClick={() => copy(jsonText)} style={{padding:"9px 18px",borderRadius:10,border:"1.5px solid "+(copied?c.brand:c.inputBorder),background:copied?c.brandLight:"transparent",color:copied?c.brand:c.textSub,fontSize:12,fontWeight:600,cursor:"pointer",marginLeft:"auto"}}>
              {copied ? "복사됨 ✓" : "JSON 복사"}
            </button>
          </div>
          <pre style={{margin:0,padding:"18px 20px",fontSize:11,lineHeight:1.7,color:c.text,overflow:"auto",maxHeight:480,background:c.bg,border:"1px solid "+c.divider,borderRadius:8,fontFamily:"monospace"}}>{jsonText}</pre>
        </div>
      )}
    </Card>
  );
}

/* ─── CATEGORIES PANEL (설정 > 직무 관리) ─── */
function CategoriesPanel(){
  const { c } = useTheme();
  const { categories, setCategories } = useCategories();
  const { rates } = useRates();
  const [editing, setEditing] = useState(null); // id
  const [form, setForm] = useState({id:"", label:"", desc:""});
  const [addMode, setAddMode] = useState(false);
  const iSt = {padding:"9px 11px",borderRadius:10,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:12,color:c.text,outline:"none",width:"100%"};

  function countUsage(catId){
    return rates.filter(r => r.category === catId).length;
  }

  async function save(){
    const id = form.id.trim();
    const label = form.label.trim();
    if(!id || !label){ alert("ID와 라벨을 입력해주세요"); return; }
    if(!/^[a-z0-9_]+$/.test(id)){ alert("ID는 영문 소문자/숫자/언더스코어만 사용"); return; }
    if(editing){
      // 수정 (ID 변경 불가)
      const u = categories.map(cat => cat.id === editing ? {...cat, label, desc: form.desc} : cat);
      setCategories(u);
      await store.set(CATEGORIES_KEY, u);
    } else {
      // 추가
      if(categories.find(cat => cat.id === id)){ alert("이미 존재하는 ID입니다"); return; }
      const u = categories.concat([{id, label, desc: form.desc}]);
      setCategories(u);
      await store.set(CATEGORIES_KEY, u);
    }
    setEditing(null);
    setAddMode(false);
    setForm({id:"", label:"", desc:""});
  }

  async function del(catId){
    const usage = countUsage(catId);
    if(usage > 0){ alert("이 카테고리를 사용 중인 직무가 "+usage+"개 있어 삭제할 수 없어요. 먼저 직무의 카테고리를 변경하세요."); return; }
    if(!confirm("정말 이 카테고리를 삭제할까요?")) return;
    const u = categories.filter(cat => cat.id !== catId);
    setCategories(u);
    await store.set(CATEGORIES_KEY, u);
  }

  function startEdit(cat){
    setEditing(cat.id);
    setAddMode(false);
    setForm({id: cat.id, label: cat.label, desc: cat.desc || ""});
  }

  return (
    <Card c={c}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:c.text}}>직무 카테고리 관리</div>
          <div style={{fontSize:12,color:c.textSub,marginTop:3}}>직무를 묶는 분류. 작업자관리의 각 직무는 이 카테고리 중 하나에 속합니다.</div>
        </div>
        <Btn onClick={() => { setAddMode(true); setEditing(null); setForm({id:"",label:"",desc:""}); }} c={c}>+ 카테고리 추가</Btn>
      </div>
      {(addMode || editing) && (
        <div style={{marginBottom:16,padding:16,background:c.bg2,borderRadius:8}}>
          <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:12,textTransform:"uppercase"}}>{editing?"카테고리 수정":"새 카테고리 추가"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div>
              <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>ID (영문)</div>
              <input value={form.id} onChange={e => setForm(p => ({...p, id: e.target.value}))} placeholder="예: data" style={iSt} disabled={!!editing}/>
              {editing && <div style={{fontSize:10,color:c.textHint,marginTop:4}}>ID는 변경할 수 없어요</div>}
            </div>
            <div>
              <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>라벨 (표시명)</div>
              <input value={form.label} onChange={e => setForm(p => ({...p, label: e.target.value}))} placeholder="예: 데이터" style={iSt}/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:c.textSub,marginBottom:6,fontWeight:600}}>설명 (선택)</div>
            <input value={form.desc} onChange={e => setForm(p => ({...p, desc: e.target.value}))} placeholder="예: 데이터 엔지니어/분석가" style={iSt}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={() => { setEditing(null); setAddMode(false); }} variant="ghost" c={c}>취소</Btn>
            <Btn onClick={save} c={c}>{editing?"저장":"추가"}</Btn>
          </div>
        </div>
      )}
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{borderBottom:"1px solid "+c.divider,background:c.bg2}}>
          <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:c.textSub,fontSize:10,textTransform:"uppercase"}}>ID</th>
          <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:c.textSub,fontSize:10,textTransform:"uppercase"}}>라벨</th>
          <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:c.textSub,fontSize:10,textTransform:"uppercase"}}>설명</th>
          <th style={{padding:"10px 12px",textAlign:"center",fontWeight:700,color:c.textSub,fontSize:10,textTransform:"uppercase"}}>사용 중 직무</th>
          <th style={{width:140}}/>
        </tr></thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id} style={{borderBottom:"1px solid "+c.divider}}>
              <td style={{padding:"12px",color:c.textSub,fontFamily:"monospace",fontSize:11}}>{cat.id}</td>
              <td style={{padding:"12px",fontWeight:600,color:c.text}}>{cat.label}</td>
              <td style={{padding:"12px",color:c.textSub,fontSize:11}}>{cat.desc||"-"}</td>
              <td style={{padding:"12px",textAlign:"center",color:c.text,fontWeight:600}}>{countUsage(cat.id)}</td>
              <td style={{padding:"12px"}}>
                <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                  <button onClick={() => startEdit(cat)} style={{padding:"4px 10px",borderRadius:8,border:"1px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:11,cursor:"pointer"}}>편집</button>
                  <button onClick={() => del(cat.id)} style={{padding:"4px 10px",borderRadius:8,border:"1.5px solid rgba(238,93,80,0.35)",background:"transparent",color:"#FA5252",fontSize:11,cursor:"pointer"}}>삭제</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ─── SETTINGS ─── */
// AI 학습 패턴 관리 패널 (REQ-AI-005)
function RevisionPatternsPanel(){
  const { c } = useTheme();
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  useEffect(() => { getPatterns().then(setList); }, []);
  const activeCount = list.filter(p => p && p.active).length;
  async function persist(next){ setList(next); await setPatterns(next); }
  async function toggleActive(id){
    await persist(list.map(p => p.id === id ? {...p, active: !p.active, updated_at: new Date().toISOString()} : p));
  }
  async function saveEdit(id){
    const text = editText.trim();
    if(!text){ alert("내용을 입력하세요"); return; }
    await persist(list.map(p => p.id === id ? {...p, pattern: text, updated_at: new Date().toISOString()} : p));
    setEditId(null); setEditText("");
  }
  async function delPattern(id){
    if(!window.confirm("이 패턴을 삭제하시겠습니까?")) return;
    await persist(list.filter(p => p.id !== id));
  }
  async function deactivateAll(){
    if(!window.confirm("모든 패턴을 비활성화 합니다. 계속하시겠습니까?")) return;
    await persist(list.map(p => ({...p, active: false, updated_at: new Date().toISOString()})));
  }
  async function deleteAll(){
    if(!window.confirm("모든 패턴을 삭제 합니다. 되돌릴 수 없습니다. 계속하시겠습니까?")) return;
    await persist([]);
  }
  const sorted = [...list].sort((a, b) => (b.updated_at||"").localeCompare(a.updated_at||""));
  return (
    <Card c={c}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:c.text}}>AI 학습 패턴</div>
          <div style={{fontSize:11,color:c.textSub,marginTop:4,lineHeight:1.5,maxWidth:560}}>RM이 "AI 제안으로 다시 보내기"에서 입력한 사유가 유사도 기준으로 누적됩니다. 활성 패턴은 다음 AI 제안의 시스템 프롬프트에 주입됩니다.</div>
        </div>
        <div style={{fontSize:12,color:c.textSub,whiteSpace:"nowrap"}}>현재 활성: <b style={{color:c.text}}>{activeCount}개</b> / {PATTERN_LIMIT}</div>
      </div>
      {sorted.length === 0 ? (
        <div style={{padding:"36px 0",textAlign:"center",color:c.textHint,fontSize:13}}>
          <div style={{fontSize:32,marginBottom:8}}>🧠</div>
          아직 학습된 패턴이 없습니다.
          <div style={{fontSize:11,color:c.textHint,marginTop:6}}>제안서 시간 검토 모달에서 "AI 제안으로 다시 보내기"를 사용하면 사유가 자동으로 누적됩니다.</div>
        </div>
      ) : (
        <div style={{overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{borderBottom:"1px solid "+c.divider,background:c.bg2}}>
                <th style={{padding:"10px 8px",textAlign:"left",fontSize:10,fontWeight:700,color:c.textSub,textTransform:"uppercase"}}>패턴</th>
                <th style={{padding:"10px 8px",textAlign:"center",fontSize:10,fontWeight:700,color:c.textSub,textTransform:"uppercase",width:60}}>횟수</th>
                <th style={{padding:"10px 8px",textAlign:"center",fontSize:10,fontWeight:700,color:c.textSub,textTransform:"uppercase",width:70}}>활성</th>
                <th style={{padding:"10px 8px",textAlign:"left",fontSize:10,fontWeight:700,color:c.textSub,textTransform:"uppercase",width:120}}>마지막 수정</th>
                <th style={{padding:"10px 8px",textAlign:"right",fontSize:10,fontWeight:700,color:c.textSub,textTransform:"uppercase",width:140}}>액션</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => (
                <tr key={p.id} style={{borderBottom:"1px solid "+c.divider}}>
                  <td style={{padding:"12px 8px",color:c.text,verticalAlign:"top"}}>
                    {editId === p.id ? (
                      <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} style={{width:"100%",padding:"6px 8px",border:"1.5px solid "+c.inputBorder,borderRadius:6,background:c.inputBg,fontSize:12,color:c.text,resize:"vertical",fontFamily:"inherit",lineHeight:1.5,boxSizing:"border-box"}}/>
                    ) : (
                      <span style={{lineHeight:1.5}}>{p.pattern}</span>
                    )}
                  </td>
                  <td style={{padding:"12px 8px",textAlign:"center",fontWeight:700,color:c.text,verticalAlign:"top"}}>{p.count||1}회</td>
                  <td style={{padding:"12px 8px",textAlign:"center",verticalAlign:"top"}}>
                    <Toggle on={!!p.active} onChange={() => toggleActive(p.id)} c={c}/>
                  </td>
                  <td style={{padding:"12px 8px",fontSize:11,color:c.textSub,verticalAlign:"top"}}>{(p.updated_at||p.created_at||"").slice(0,10)}</td>
                  <td style={{padding:"12px 8px",textAlign:"right",verticalAlign:"top"}}>
                    {editId === p.id ? (
                      <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                        <button onClick={() => { setEditId(null); setEditText(""); }} style={{padding:"5px 10px",borderRadius:6,border:"1px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:11,cursor:"pointer"}}>취소</button>
                        <button onClick={() => saveEdit(p.id)} style={{padding:"5px 10px",borderRadius:6,border:"none",background:c.brand,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>저장</button>
                      </div>
                    ) : (
                      <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                        <button onClick={() => { setEditId(p.id); setEditText(p.pattern); }} style={{padding:"5px 10px",borderRadius:6,border:"1px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:11,cursor:"pointer"}}>편집</button>
                        <button onClick={() => delPattern(p.id)} style={{padding:"5px 10px",borderRadius:6,border:"1px solid rgba(250,82,82,0.3)",background:"transparent",color:"#FA5252",fontSize:11,cursor:"pointer"}}>삭제</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sorted.length > 0 && (
        <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid "+c.divider,display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={deactivateAll} style={{padding:"7px 14px",borderRadius:6,border:"1px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:12,fontWeight:600,cursor:"pointer"}}>전체 비활성화</button>
          <button onClick={deleteAll} style={{padding:"7px 14px",borderRadius:6,border:"none",background:"#FA5252",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>모두 삭제</button>
        </div>
      )}
    </Card>
  );
}

function Settings({ team, setTeam, currentUser, perms, setPerms }){
  const { c } = useTheme();
  const isAdmin = !!currentUser.isAdmin || currentUser.grade === "관리자";
  const isLead = !isAdmin && (currentUser.grade === "팀장" || currentUser.grade === "Lead RM");
  const availableTabs = isAdmin
    ? ["계정","RM 팀","직무","권한","AI 학습 패턴","데이터"]
    : (isLead ? ["AI 학습 패턴"] : []);
  const [tab, setTab] = useState(availableTabs[0] || "");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({name:"",email:"",password:"",grade:"Mid RM",isAdmin:false});
  const [newTagName, setNewTagName] = useState("");
  const loginUsers = team.filter(t => !t.tagOnly);
  const tagOnlyUsers = team.filter(t => t.tagOnly);
  const iSt = {width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:c.text,outline:"none"};

  async function saveMember(){
    let updated;
    if(editId){
      updated = team.map(t => t.id === editId ? {...t, name:form.name, email:form.email, grade:form.grade, isAdmin:form.isAdmin, ...(form.password?{password:form.password}:{})} : t);
    } else {
      updated = team.concat([{id:String(Date.now()), name:form.name, email:form.email, password:form.password, grade:form.grade, isAdmin:form.isAdmin, tagOnly:false, createdAt:new Date().toISOString()}]);
    }
    setTeam(updated);
    await store.set("teams", updated);
    setEditId(null);
    setShowForm(false);
    setForm({name:"",email:"",password:"",grade:"Mid RM",isAdmin:false});
  }

  async function removeMember(id){
    if(id === currentUser.id){ alert("본인 계정은 삭제할 수 없어요"); return; }
    const u = team.filter(t => t.id !== id);
    setTeam(u);
    await store.set("teams", u);
  }

  async function addTagOnly(){
    const name = newTagName.trim();
    if(!name) return;
    if(team.find(t => t.name === name)){ alert("이미 등록된 이름이에요"); return; }
    const updated = team.concat([{id:String(Date.now()), name, grade:"", tagOnly:true}]);
    setTeam(updated);
    await store.set("teams", updated);
    setNewTagName("");
  }

  function togglePerm(menuId, role){
    const u = {...perms, [menuId]: {...perms[menuId], [role]: !perms[menuId][role]}};
    setPerms(u);
    store.set("perms", u);
  }

  if(!isAdmin && !isLead){
    return (
      <div>
        <div style={{fontSize:24,fontWeight:800,color:c.text,marginBottom:4}}>내 프로필</div>
        <div style={{fontSize:13,color:c.textSub,marginBottom:24}}>내 계정 정보</div>
        <Card c={c}>
          <div style={{marginBottom:24,paddingBottom:16,borderBottom:"1px solid "+c.divider}}>
            <div style={{fontSize:17,fontWeight:700,color:c.text}}>{currentUser.name}</div>
            <div style={{fontSize:12,color:c.textSub,marginTop:2}}>{currentUser.grade}</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{fontSize:18,fontWeight:700,color:c.text,marginBottom:4}}>설정</div>
      <div style={{fontSize:13,color:c.textSub,marginBottom:20}}>팀 구성 및 시스템 권한</div>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid "+c.divider,marginBottom:24}}>
        {availableTabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{padding:"8px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t?700:500,color:tab===t?c.brand:c.textSub,borderBottom:tab===t?"2px solid "+c.brand:"2px solid transparent",marginBottom:-1}}>{t}</button>
        ))}
      </div>
      {tab === "AI 학습 패턴" && <RevisionPatternsPanel/>}
      {tab === "계정" && (
        <Card c={c}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontSize:15,fontWeight:700,color:c.text}}>로그인 계정 관리</div>
            <button onClick={() => { setShowForm(true); setEditId(null); setForm({name:"",email:"",password:"",grade:"Mid RM",isAdmin:false}); }} style={{padding:"8px 14px",borderRadius:10,border:"1.5px solid "+c.inputBorder,background:"transparent",color:c.textSub,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ 직접 추가</button>
          </div>
          {loginUsers.map((u, i) => (
            <div key={u.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<loginUsers.length-1&&editId!==u.id?"1px solid "+c.divider:"none"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:700,color:c.text}}>{u.name}</span>
                    {u.isAdmin && <span style={{fontSize:10,padding:"2px 8px",borderRadius:6,background:c.brandLight,color:c.brand,fontWeight:700}}>관리자</span>}
                    {u.id === currentUser.id && <span style={{fontSize:10,color:c.textHint}}>(나)</span>}
                  </div>
                  <div style={{fontSize:11,color:c.textSub,marginTop:3}}>{u.grade}{u.email?" · "+u.email:""}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={() => { if(editId===u.id){ setEditId(null); } else { setEditId(u.id); setForm({name:u.name,email:u.email||"",password:"",grade:u.grade,isAdmin:!!u.isAdmin}); } setShowForm(false); }}
                    style={{padding:"6px 14px",borderRadius:10,border:"1.5px solid "+(editId===u.id?c.brand:c.inputBorder),background:editId===u.id?c.brandLight:"transparent",color:editId===u.id?c.brand:c.textSub,fontSize:12,cursor:"pointer"}}>{editId===u.id?"닫기":"편집"}</button>
                  {u.id !== currentUser.id && <button onClick={() => removeMember(u.id)} style={{padding:"6px 12px",borderRadius:10,border:"1.5px solid rgba(238,93,80,0.35)",background:"transparent",color:"#FA5252",fontSize:12,cursor:"pointer"}}>삭제</button>}
                </div>
              </div>
              {editId === u.id && (
                <div style={{padding:16,background:c.bg2,borderRadius:8,marginBottom:8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <Inp label="이름" value={form.name} onChange={v => setForm(p => ({...p, name:v}))} c={c}/>
                    <Inp label="이메일" value={form.email} onChange={v => setForm(p => ({...p, email:v}))} c={c}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                    <Inp label="비밀번호 재설정 (선택)" value={form.password} onChange={v => setForm(p => ({...p, password:v}))} c={c} type="password"/>
                    <div>
                      <div style={{fontSize:12,color:c.textSub,marginBottom:7,fontWeight:600}}>직급</div>
                      <select value={form.grade} onChange={e => setForm(p => ({...p, grade:e.target.value}))} style={iSt}>{ROLES.map(g => <option key={g}>{g}</option>)}</select>
                    </div>
                  </div>
                  {u.id !== currentUser.id && (
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                      <Toggle on={form.isAdmin} onChange={() => setForm(p => ({...p, isAdmin:!p.isAdmin}))} c={c}/>
                      <span style={{fontSize:12,color:c.text}}>관리자 권한 부여</span>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                    <Btn onClick={() => setEditId(null)} variant="ghost" c={c}>취소</Btn>
                    <Btn onClick={saveMember} c={c}>저장</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
          {showForm && !editId && (
            <div style={{padding:16,background:c.bg2,borderRadius:8,marginTop:12}}>
              <div style={{fontSize:12,fontWeight:700,color:c.textSub,marginBottom:12,textTransform:"uppercase"}}>신규 계정 추가</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <Inp label="이름 *" value={form.name} onChange={v => setForm(p => ({...p, name:v}))} c={c}/>
                <Inp label="이메일 *" value={form.email} onChange={v => setForm(p => ({...p, email:v}))} c={c}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <Inp label="초기 비밀번호 *" value={form.password} onChange={v => setForm(p => ({...p, password:v}))} c={c} type="password"/>
                <div>
                  <div style={{fontSize:12,color:c.textSub,marginBottom:7,fontWeight:600}}>직급</div>
                  <select value={form.grade} onChange={e => setForm(p => ({...p, grade:e.target.value}))} style={iSt}>{ROLES.map(g => <option key={g}>{g}</option>)}</select>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <Toggle on={form.isAdmin} onChange={() => setForm(p => ({...p, isAdmin:!p.isAdmin}))} c={c}/>
                <span style={{fontSize:12,color:c.text}}>관리자 권한 부여</span>
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <Btn onClick={() => setShowForm(false)} variant="ghost" c={c}>취소</Btn>
                <Btn onClick={saveMember} c={c}>추가</Btn>
              </div>
            </div>
          )}
        </Card>
      )}
      {tab === "RM 팀" && (
        <Card c={c}>
          <div style={{fontSize:14,fontWeight:600,color:c.text,marginBottom:18}}>RM 배정 목록</div>
          {loginUsers.map((u, i) => (
            <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<loginUsers.length-1?"1px solid "+c.divider:"none"}}>
              <span style={{fontSize:13,fontWeight:600,color:c.text}}>{u.name}</span>
              <span style={{fontSize:12,color:c.textSub}}>{u.grade || "—"}</span>
            </div>
          ))}
          {tagOnlyUsers.map((u, i) => (
            <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<tagOnlyUsers.length-1?"1px solid "+c.divider:"none"}}>
              <span style={{fontSize:13,fontWeight:600,color:c.text}}>{u.name}</span>
              <button onClick={() => removeMember(u.id)} style={{padding:"4px 10px",borderRadius:8,border:"1.5px solid rgba(238,93,80,0.35)",background:"transparent",color:"#FA5252",fontSize:11,cursor:"pointer"}}>삭제</button>
            </div>
          ))}
          <div style={{borderTop:"1px solid "+c.divider,paddingTop:14,display:"flex",gap:8,marginTop:14}}>
            <input value={newTagName} onChange={e => setNewTagName(e.target.value)} onKeyDown={e => { if(e.key === "Enter") addTagOnly(); }} placeholder="이름만 등록 (로그인 없음)" style={{flex:1,padding:"11px 14px",borderRadius:12,border:"1.5px solid "+c.inputBorder,background:c.inputBg,fontSize:13,color:c.text,outline:"none"}}/>
            <button onClick={addTagOnly} style={{padding:"11px 18px",borderRadius:12,border:"1.5px solid "+c.brand,background:"transparent",color:c.brand,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ 추가</button>
          </div>
        </Card>
      )}
      {tab === "권한" && (
        <Card c={c}>
          <div style={{fontSize:15,fontWeight:700,color:c.text,marginBottom:6}}>메뉴 접근 권한</div>
          <div style={{fontSize:12,color:c.textSub,marginBottom:20}}>메뉴별로 RM / 관리자 그룹의 접근을 제어하세요</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px"}}>
            <div style={{padding:"10px 0",fontSize:10,fontWeight:700,color:c.textSub,borderBottom:"1px solid "+c.divider,textTransform:"uppercase"}}>메뉴</div>
            {["RM","팀장","관리자"].map(r => <div key={r} style={{padding:"10px 0",textAlign:"center",fontSize:10,fontWeight:700,color:c.textSub,borderBottom:"1px solid "+c.divider,textTransform:"uppercase"}}>{r}</div>)}
            {Object.entries(perms).map(([id, roles]) => [
              <div key={id+"-l"} style={{padding:"15px 0",fontSize:13,fontWeight:500,color:c.text,borderBottom:"1px solid "+c.divider,display:"flex",alignItems:"center"}}>{MENU_LABELS[id] || id}</div>,
              <div key={id+"-RM"} style={{padding:"15px 0",textAlign:"center",borderBottom:"1px solid "+c.divider,display:"flex",alignItems:"center",justifyContent:"center"}}><Toggle on={!!roles["RM"]} onChange={() => togglePerm(id, "RM")} c={c}/></div>,
              <div key={id+"-팀장"} style={{padding:"15px 0",textAlign:"center",borderBottom:"1px solid "+c.divider,display:"flex",alignItems:"center",justifyContent:"center"}}><Toggle on={!!roles["팀장"]} onChange={() => togglePerm(id, "팀장")} c={c}/></div>,
              <div key={id+"-관리자"} style={{padding:"15px 0",textAlign:"center",borderBottom:"1px solid "+c.divider,display:"flex",alignItems:"center",justifyContent:"center"}}><Toggle on={!!roles["관리자"]} onChange={() => togglePerm(id, "관리자")} c={c}/></div>,
            ])}
          </div>
        </Card>
      )}
      {tab === "직무" && <CategoriesPanel/>}
      {tab === "데이터" && <DataExportPanel/>}
    </div>
  );
}

/* ─── AUTH ─── */

// ─── 외부 노출 (named re-exports for crm_rm_v2 components/) ──────────────
export { AlertBell, Dashboard, Customers, Consulting, Contract, Workers, Settings,
         TeamBuildingDetail, BriefingDetail, ConsultNotes, ConsultRfp, TagInput,
         CategoriesPanel, RevisionPatternsPanel, DataExportPanel,
         ProposalEditForm, ProposalPreview, VariantEditor, VariantCard,
         ModeSelectDialog, HoursReviewModal, RevisionReasonDialog,
         MonitoringSubsPanel,
         RMSelector, MdBlock };
