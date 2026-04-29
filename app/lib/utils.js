"use client";
// 공통 유틸 — 날짜, 마이그레이션, 시급/금액 계산, 패턴 학습 헬퍼

import { store } from "./store";
import { callClaude } from "./ai";
import {
  DEFAULT_AI_CONFIG, DEFAULT_CATEGORIES, STAGE_ORDER,
  AI_DISCOUNT_RATE, AI_DURATION_REDUCTION, HARNESS_RATE_MULTIPLIER,
  PATTERN_KEY, PATTERN_LIMIT,
  ROLE_GROUP_MAP, PERMISSIONS,
} from "./constants";

// ─── 날짜 ─────────────────────────────────────────
export function todayInfo() {
  const d = new Date();
  return {
    str: d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0"),
    date: d.toISOString().split("T")[0],
    korDay: ["일","월","화","수","목","금","토"][d.getDay()],
  };
}

// ─── 시급/등급 마이그레이션 ────────────────────────
export function migrateRates(rates) {
  const CATEGORY_MAP = {
    "프로젝트 매니저": "plan", "기획자": "plan", "UX/UI 디자이너": "plan",
    "Web 개발자": "dev", "Server 개발자": "dev", "Mobile 개발자": "dev",
    "QA 엔지니어": "qa", "퍼블리셔": "publisher",
  };
  return (rates || []).map(r => {
    if (r.category) return r;
    return { ...r, category: CATEGORY_MAP[r.role] || "other" };
  });
}

// ─── 파이프라인 자동 상태 (REQ-PIPELINE-002) ───────
export function getCompletedStages(cu) {
  const done = new Set(["신규접수"]);
  if (cu.rm_name) done.add("RM배정");
  if (cu.briefing) done.add("브리핑완료");
  if (STAGE_ORDER.indexOf(cu.status) >= STAGE_ORDER.indexOf("미팅완료")) done.add("미팅완료");
  // RFP 문서 존재 시 → RFP 상태 (팀빌딩검토 대체)
  if (cu.rfp || cu.rfp_doc1 || cu.team_building || cu.proposal_data) done.add("RFP");
  if (cu.status === "계약성사") done.add("계약성사");
  if (cu.status === "이탈") done.add("이탈");
  return done;
}
export function autoStatus(cu) {
  if (["계약성사", "이탈"].includes(cu.status)) return cu.status;
  const done = getCompletedStages(cu);
  for (const s of ["RFP", "미팅완료", "브리핑완료", "RM배정"]) if (done.has(s)) return s;
  return "신규접수";
}
export function applyCorrections(data) {
  return data.map(cu => { const s = autoStatus(cu); return s !== cu.status ? { ...cu, status: s } : cu; });
}

// ─── 멤버 ID/마이그레이션 (REQ-PROPOSAL-007) ───────
export function withId(m) {
  if (m.id) return m;
  return { ...m, id: "m_" + Math.random().toString(36).slice(2, 10) };
}
export function migrateMember(m) {
  const wm = withId({ ...m });
  if (typeof wm.is_harness !== "boolean") wm.is_harness = false;
  if (wm.max_hours == null || wm.max_hours === "" || isNaN(Number(wm.max_hours))) {
    const wh = Number(wm.weekly_hours || 0);
    wm.max_hours = wh > 0 ? Math.round(wh * 1.25) : 50;
  }
  return wm;
}
export function newVariant(mode) {
  return {
    mode: mode || "subscription",
    label: "",
    scope_of_work: [],
    members: [],
    total_months: 1,
    monthly_hours: {},
  };
}

export function migrateProposal(data) {
  if (!data) return null;
  const out = { ...data };
  if (!out.ai_config) out.ai_config = { ...DEFAULT_AI_CONFIG };
  else out.ai_config = { token_cap: Number(out.ai_config.token_cap || (out.ai_config.token_cap_enabled && out.ai_config.token_cap) || 1000000) };

  out.plans = (out.plans || [{ name: "A안" }]).map((p, idx) => {
    if (p.variants && Array.isArray(p.variants)) {
      return {
        name: p.name || (idx === 0 ? "A안" : "B안"),
        variants: p.variants.map(v => ({
          mode: v.mode || "subscription",
          label: v.label || "",
          scope_of_work: v.scope_of_work || [],
          members: (v.members || []).map(migrateMember),
          total_months: Number(v.total_months || 1),
          monthly_hours: v.monthly_hours || {},
        })),
      };
    }
    const legacyMode = p.mode === "ai" ? "ai_h" : "subscription";
    const baseMonths = Number((data.ai_config && data.ai_config.project_months) || (data.harness_config && data.harness_config.project_months) || 1);
    return {
      name: p.name || (idx === 0 ? "A안" : "B안"),
      variants: [{
        mode: legacyMode, label: "",
        scope_of_work: p.scope_of_work || [],
        members: (p.members || []).map(migrateMember),
        total_months: baseMonths, monthly_hours: {},
      }],
    };
  });
  if (!out.monitoring_subscriptions) out.monitoring_subscriptions = [];
  delete out.harness_config;
  return out;
}

export function normalizeMember(m, rates, categories) {
  const clean = withId({ ...m });
  if (clean.role_key && clean.role_key !== "__custom") {
    const r = (rates || []).find(x => x.role === clean.role_key);
    if (r) {
      if (r.category) clean.category = r.category;
      const g = (r.grades || []).find(x => x.g === clean.grade);
      if (g) clean.rate = g.r;
    }
  }
  if (typeof clean.is_harness !== "boolean") clean.is_harness = false;
  if (clean.max_hours == null) {
    const wh = Number(clean.weekly_hours || 0);
    clean.max_hours = wh > 0 ? Math.round(wh * 1.25) : 50;
  }
  return clean;
}

// ─── 시급/금액 계산 (POL-PRICING-002) ──────────────
export function harnessMul(m) { return m && m.is_harness ? HARNESS_RATE_MULTIPLIER : 1.0; }
export function effectiveRate(m) { return Math.round(Number(m.rate || 0) * harnessMul(m)); }

// 멤버별 개별 투입 기간 (POL-PRICING-003)
// m.months 미설정 시 variant.total_months로 폴백, total_months 초과 시 캡.
export function memberMonths(m, variant) {
  const total = Math.max(0.25, Number((variant && variant.total_months) || 1));
  const v = Number(m && m.months);
  if (!isFinite(v) || v <= 0) return total;
  return Math.min(total, Math.max(0.25, v));
}
// monthIdx(0-based)에서 멤버 활성 비율 (0..1). 마지막 부분달은 fractional.
export function memberMonthFactor(m, variant, monthIdx) {
  const months = memberMonths(m, variant);
  const full = Math.floor(months);
  if (monthIdx + 1 <= full) return 1.0;
  const frac = months - full;
  if (frac > 0 && monthIdx === full) return frac;
  return 0;
}

export function calcAmount(m) {
  const t = m.contract_type || "hourly";
  if (t === "monthly_fixed") return Number(m.monthly_amount || 0);
  if (t === "short_term") return Number(m.total_amount || 0);
  return Number(m.weekly_hours || 0) * 4 * effectiveRate(m);
}
export function calcMemberMonthAmount(m, monthKey, monthlyHoursMap) {
  const t = m.contract_type || "hourly";
  if (t === "monthly_fixed") return Number(m.monthly_amount || 0);
  if (t === "short_term") return 0;
  const rate = effectiveRate(m);
  const mh = monthlyHoursMap && m.id && monthlyHoursMap[m.id] && monthlyHoursMap[m.id][monthKey];
  if (mh != null) return Number(mh) * rate;
  return Number(m.weekly_hours || 0) * 4 * rate;
}
export function calcVariantMonthSplit(variant, monthIdx) {
  const members = variant.members || [];
  const mhMap = variant.monthly_hours || {};
  const monthKey = String(monthIdx + 1);
  let normal = 0, harness = 0;
  for (const m of members) {
    let amt;
    if ((m.contract_type || "hourly") === "short_term") {
      // short_term은 첫 달 일시 지급 — 멤버 기간과 무관
      amt = monthIdx === 0 ? Number(m.total_amount || 0) * harnessMul(m) : 0;
    } else {
      const factor = memberMonthFactor(m, variant, monthIdx);
      if (factor === 0) continue;
      amt = calcMemberMonthAmount(m, monthKey, mhMap) * factor;
    }
    if (m.is_harness) harness += amt; else normal += amt;
  }
  return { normal, harness };
}
export function calcVariantSplitTotal(variant) {
  // 부분달은 memberMonthFactor가 멤버별로 처리하므로 variant 레벨 fractional 보정은 불필요.
  const months = Math.max(0.25, Number(variant.total_months || 1));
  const monthCount = Math.ceil(months);
  let normal = 0, harness = 0;
  for (let i = 0; i < monthCount; i++) {
    const s = calcVariantMonthSplit(variant, i);
    normal += s.normal;
    harness += s.harness;
  }
  return { normal, harness };
}
export function calcVariantHumanTotal(variant) {
  const s = calcVariantSplitTotal(variant);
  return Math.round(s.normal + s.harness);
}
export function calcVariantAvgMonthly(variant) {
  const months = Math.max(0.25, Number(variant.total_months || 1));
  return Math.round(calcVariantHumanTotal(variant) / months);
}
export function calcVariantTotals(variant, config) {
  const isAi = variant.mode === "ai_h";
  const split = calcVariantSplitTotal(variant);
  const humanTotal = Math.round(split.normal + split.harness);
  const baseMonths = Number(variant.total_months || 1);
  const teamTotal = isAi
    ? Math.round(split.normal * (1 - AI_DISCOUNT_RATE) + split.harness)
    : Math.round(split.normal + split.harness);
  const months = isAi ? Math.round(baseMonths * (1 - AI_DURATION_REDUCTION) * 100) / 100 : baseMonths;
  const avgMonthly = Math.round(teamTotal / Math.max(0.25, months));
  return {
    isAi, humanTotal, teamTotal, months, avgMonthly,
    harnessTotal: Math.round(split.harness),
    normalTotal: Math.round(split.normal),
    tokenCap: Number((config && config.token_cap) || 1000000),
  };
}

// ─── 파일 읽기 ────────────────────────────────────
export function readFileAsBase64(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
}
export function readFileAsText(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(file); });
}

// ─── 고객 로드 (사용자 키 마이그레이션 포함) ────────
export async function loadCustomers(KEY) {
  let data = await store.get(KEY, []);
  if (!data.length) { const leg = await store.get("customers", []); if (leg.length) data = leg; }
  if (!data.length) {
    const keys = await store.list("customers");
    for (const k of keys) { if (k === KEY) continue; const d = await store.get(k, []); if (d.length) { data = d; break; } }
  }
  if (!data.length) return [];
  const corrected = applyCorrections(data);
  await store.set(KEY, corrected);
  return corrected;
}

// ─── 패턴 학습 (REQ-AI-005) ───────────────────────
export async function getPatterns() {
  try { const raw = await store.get(PATTERN_KEY, []); return Array.isArray(raw) ? raw : []; }
  catch (e) { return []; }
}
export async function setPatterns(arr) { await store.set(PATTERN_KEY, arr); }

export async function buildRevisionPatternsBlock() {
  const list = await getPatterns();
  const active = list.filter(p => p && p.active).sort((a, b) => (b.count || 0) - (a.count || 0));
  if (active.length === 0) return "";
  const lines = active.map((p, i) => `${i + 1}. ${p.pattern} (${p.count || 1}회)`).join("\n");
  return "\n\n## RM 피드백 패턴 (이전 제안에서 자주 지적된 사항, 우선 반영)\n" + lines;
}

export async function isSimilarPattern(a, b) {
  try {
    const sys = "두 사유가 같은 의미를 표현하는지 판정하세요. 표현이 달라도 핵심 의도가 같으면 Y. 반드시 'Y' 또는 'N' 한 글자만 반환하세요.";
    const r = await callClaude(sys, "사유 A: " + a + "\n사유 B: " + b, 5);
    return /^\s*Y/i.test(r || "");
  } catch (e) { return false; }
}

export async function addPattern(reason) {
  if (!reason || !reason.trim()) return;
  const text = reason.trim();
  const list = await getPatterns();
  const actives = list.filter(p => p && p.active);
  for (const p of actives) {
    if (await isSimilarPattern(text, p.pattern)) {
      const idx = list.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        list[idx] = { ...p, count: (p.count || 1) + 1, updated_at: new Date().toISOString() };
        await setPatterns(list);
      }
      return;
    }
  }
  const now = new Date().toISOString();
  list.push({ id: "p_" + Math.random().toString(36).slice(2, 10), pattern: text, count: 1, active: true, created_at: now, updated_at: now });
  if (list.length > PATTERN_LIMIT) {
    list.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    let removed = false;
    for (let i = 0; i < list.length; i++) {
      if (!list[i].active) { list.splice(i, 1); removed = true; break; }
    }
    if (!removed) list.shift();
  }
  await setPatterns(list);
}

// ─── 권한 그룹 (ACC-ROLE-001) ──────────────────────
// ─── GRIDGE 5역할 시스템 (GRIDGE_PERMISSIONS.md §3) ──────────────────────
export function roleGroupOf(user) {
  if (!user) return "STAFF_RM";
  if (user.id === "local") return "LOCAL";
  if (user.isAdmin) return "TEAM_LEAD";
  return ROLE_GROUP_MAP[user.grade] || "STAFF_RM";
}

// 권한 체크 (GRIDGE_PERMISSIONS.md §4)
export function can(user, action) {
  const group = roleGroupOf(user);
  const allowed = PERMISSIONS[action];
  if (!allowed) return true; // 미정의 권한은 기본 허용
  return allowed.indexOf(group) !== -1;
}

// 레거시 호환: 기존 코드가 "관리자"/"팀장"/"RM" 문자열을 기대하는 경우
export function roleGroupOfLegacy(user) {
  if (!user) return "RM";
  if (user.isAdmin || user.grade === "관리자") return "관리자";
  if (user.grade === "팀장" || user.grade === "Lead RM") return "팀장";
  return "RM";
}
