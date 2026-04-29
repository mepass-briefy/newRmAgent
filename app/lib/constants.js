"use client";
// GRIDGE Design System v2 — DS-COLOR-* / GRIDGE_DESIGN_SYSTEM.md 기준

export const FONT_URL = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap";

// ─── Pipeline 상태 색상 (시드 무관 공통 ST) ──────────────────────────────
export const ST = {
  "신규접수":  "#80CBC4",
  "RM배정":    "#90CAF9",
  "브리핑완료":"#80CB6E",
  "미팅완료":  "#FFB950",
  "RFP":       "#CE93D8",
  "계약성사":  "#A5D6A7",
  "이탈":      "#F2B8B5",
};

// ─── 테마 토큰 (c.xxx 네이밍 유지 — 기존 컴포넌트 호환) ─────────────────
export const H = {
  // Teal Dark (GRIDGE 기본)
  dark: {
    bg:          "#0D1117",
    bg2:         "#1B2330",
    card:        "#161D25",
    cardBorder:  "#253341",
    cardShadow:  "0 2px 16px rgba(0,0,0,.55)",
    text:        "#D8E3F0",
    textSub:     "#8FA3B5",
    textHint:    "#6882A0",
    brand:       "#80CBC4",
    brandLight:  "rgba(128,203,196,0.13)",
    brandDark:   "#00514A",
    inputBg:     "#273140",
    inputBorder: "#253341",
    divider:     "#253341",
    error:       "#F2B8B5",
    errorCont:   "rgba(242,184,181,0.12)",
    errorBorder: "rgba(242,184,181,0.28)",
    success:     "#80CB6E",
    successCont: "rgba(128,203,110,0.12)",
    warn:        "#FFB950",
    warnCont:    "rgba(255,185,80,0.12)",
    // Status badge colors (dot/text color from ST, bg uniform)
    sNew:    { dot: ST["신규접수"],  bg: "rgba(128,203,196,0.12)",  color: ST["신규접수"]  },
    sRM:     { dot: ST["RM배정"],    bg: "rgba(144,202,249,0.12)",  color: ST["RM배정"]    },
    sBrief:  { dot: ST["브리핑완료"], bg: "rgba(128,203,110,0.12)", color: ST["브리핑완료"] },
    sMeeting:{ dot: ST["미팅완료"],  bg: "rgba(255,185,80,0.12)",   color: ST["미팅완료"]  },
    sRfp:    { dot: ST["RFP"],       bg: "rgba(206,147,216,0.12)",  color: ST["RFP"]       },
    sWon:    { dot: ST["계약성사"],  bg: "rgba(165,214,167,0.12)",  color: ST["계약성사"]  },
    sLost:   { dot: ST["이탈"],      bg: "rgba(242,184,181,0.12)",  color: ST["이탈"]      },
  },
  // Teal Light
  light: {
    bg:          "#F0F0F2",
    bg2:         "#EEEEF2",
    card:        "#FAFAFA",
    cardBorder:  "rgba(0,107,99,0.12)",
    cardShadow:  "0 1px 4px rgba(0,0,0,0.06)",
    text:        "#1C1C2E",
    textSub:     "#7A7A8A",
    textHint:    "#A0A0B0",
    brand:       "#006B63",
    brandLight:  "rgba(0,107,99,0.10)",
    brandDark:   "#004F49",
    inputBg:     "#E6E6EA",
    inputBorder: "#E2E2E8",
    divider:     "#E2E2E8",
    error:       "#AA3030",
    errorCont:   "rgba(170,50,50,0.07)",
    errorBorder: "rgba(170,50,50,0.22)",
    success:     "#2A7A2A",
    successCont: "rgba(42,122,42,0.08)",
    warn:        "#B06010",
    warnCont:    "rgba(176,96,16,0.08)",
    sNew:    { dot: "#006B63", bg: "rgba(0,107,99,0.08)",   color: "#006B63" },
    sRM:     { dot: "#1A50A0", bg: "rgba(26,80,160,0.08)",  color: "#1A50A0" },
    sBrief:  { dot: "#2A7A2A", bg: "rgba(42,122,42,0.08)",  color: "#2A7A2A" },
    sMeeting:{ dot: "#B06010", bg: "rgba(176,96,16,0.08)",  color: "#B06010" },
    sRfp:    { dot: "#7B3FA0", bg: "rgba(123,63,160,0.08)", color: "#7B3FA0" },
    sWon:    { dot: "#2A7A2A", bg: "rgba(42,122,42,0.10)",  color: "#1E5E1E" },
    sLost:   { dot: "#AA3030", bg: "rgba(170,50,50,0.08)",  color: "#AA3030" },
  },
};

// ─── 파이프라인 상태 ─────────────────────────────────────────────────────
// "팀빌딩검토" → "RFP" (GRIDGE spec)
export const STATUS_MAP = {
  "신규접수": { key: "sNew"    },
  "RM배정":   { key: "sRM"     },
  "브리핑완료":{ key: "sBrief" },
  "미팅완료": { key: "sMeeting"},
  "RFP":      { key: "sRfp"   },
  "계약성사": { key: "sWon"   },
  "이탈":     { key: "sLost"  },
};
export const STAGE_ORDER = ["신규접수","RM배정","브리핑완료","미팅완료","RFP","계약성사","이탈"];
export const STATUSES    = ["신규접수","RM배정","브리핑완료","미팅완료","RFP","계약성사","이탈"];

export const INDUSTRIES = ["핀테크","헬스케어","이커머스","에듀테크","물류","SaaS","제조","미디어","부동산","기타"];
export const DEVICES = ["웹(PC)","웹(모바일)","안드로이드앱","iOS앱","기타"];
export const WORKER_TYPES = ["개발자","디자이너","기획자","QA엔지니어","데이터분석가","DevOps","기타"];
export const GRADE_ORDER = ["신입(1년)","초급(2~3년)","중급(4~6년)","중급2(7~8년)","고급(9년+)"];

// ─── 역할 정의 (GRIDGE_PERMISSIONS.md §1) ───────────────────────────────
export const ROLES = ["Junior RM","Mid RM","Senior RM","시니어 RM","주니어 RM","신입 RM","팀장","관리자","로컬"];

// grade 값 → 권한 그룹 매핑
export const ROLE_GROUP_MAP = {
  "관리자":    "TEAM_LEAD",
  "팀장":      "TEAM_LEAD",
  "시니어 RM": "SENIOR_RM",
  "Senior RM": "SENIOR_RM",
  "Mid RM":    "JUNIOR_RM",
  "주니어 RM": "JUNIOR_RM",
  "Junior RM": "JUNIOR_RM",
  "신입 RM":   "STAFF_RM",
  "로컬":      "LOCAL",
};

// ─── 권한 매트릭스 (GRIDGE_PERMISSIONS.md §4) ───────────────────────────
export const PERMISSIONS = {
  "customer.delete":           ["SENIOR_RM","TEAM_LEAD","LOCAL"],
  "customer.view_all":         ["TEAM_LEAD"],
  "project.status_change":     ["SENIOR_RM","JUNIOR_RM","TEAM_LEAD","LOCAL"],
  "project.abandon":           ["SENIOR_RM","TEAM_LEAD","LOCAL"],
  "project.delete":            ["SENIOR_RM","TEAM_LEAD","LOCAL"],
  "requirement.confirm":       ["SENIOR_RM","JUNIOR_RM","TEAM_LEAD","LOCAL"],
  "requirement.edit_full":     ["SENIOR_RM","JUNIOR_RM","TEAM_LEAD","LOCAL"],
  "rfp.team_edit":             ["SENIOR_RM","JUNIOR_RM","TEAM_LEAD","LOCAL"],
  "contract.create":           ["SENIOR_RM","TEAM_LEAD","LOCAL"],
  "contract.terminate":        ["SENIOR_RM","TEAM_LEAD","LOCAL"],
  "worker.create":             ["SENIOR_RM","JUNIOR_RM","TEAM_LEAD","LOCAL"],
  "settings.team_manage":      ["TEAM_LEAD"],
  "settings.rates_edit":       ["TEAM_LEAD"],
  "settings.permissions_edit": ["TEAM_LEAD"],
  "note.delete_own":           ["SENIOR_RM","JUNIOR_RM","TEAM_LEAD","LOCAL"],
};

// 신입/미들 RM 가이드 트리거 (GRIDGE_PERMISSIONS.md §5)
export const STAFF_GUIDE_TRIGGERS = {
  "requirement.confirm":   "요구사항을 확정하면 RFP 생성에 반영됩니다. 내용이 맞는지 시니어 RM과 함께 확인해보세요.",
  "project.status_change": "상태를 변경하면 고객 관리 현황에 반영됩니다. 변경 전 팀장 또는 시니어 RM에게 공유해주세요.",
  "rfp.team_edit":         "팀 구성과 견적은 제안서에 그대로 들어갑니다. 시니어 RM의 확인을 권장합니다.",
};

export const DEFAULT_PERMS = {customers:{RM:true,팀장:true,관리자:true},consulting:{RM:true,팀장:true,관리자:true},contract:{RM:false,팀장:true,관리자:true},workers:{RM:true,팀장:true,관리자:true}};
export const MENU_LABELS = {customers:"고객관리",consulting:"상담관리",contract:"계약관리",workers:"작업자관리"};

// ─── 시급표 (GRIDGE_RM_CRM_CONTEXT.md §18) ──────────────────────────────
export const DEFAULT_RATES = [
  {role:"프로젝트 매니저",category:"plan",grades:[{g:"초급(2~3년)",r:28220},{g:"중급(4~6년)",r:46480},{g:"중급2(7~8년)",r:64740},{g:"고급(9년+)",r:83000}]},
  {role:"기획자",category:"plan",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:26560},{g:"중급(4~6년)",r:43160},{g:"중급2(7~8년)",r:63080},{g:"고급(9년+)",r:83000}]},
  {role:"UX/UI 디자이너",category:"plan",grades:[{g:"신입(1년)",r:24900},{g:"초급(2~3년)",r:28220},{g:"중급(4~6년)",r:33200},{g:"중급2(7~8년)",r:45650},{g:"고급(9년+)",r:58100}]},
  {role:"그래픽 디자이너",category:"plan",grades:[{g:"신입(1년)",r:24900},{g:"초급(2~3년)",r:28220},{g:"중급(4~6년)",r:33200},{g:"중급2(7~8년)",r:45650},{g:"고급(9년+)",r:58100}]},
  {role:"Web 개발자",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"Server 개발자",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"Mobile 개발자",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"Data 엔지니어",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"DevOps",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"QA 엔지니어",category:"qa",grades:[{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:33200},{g:"중급2(7~8년)",r:37350},{g:"고급(9년+)",r:41500}]},
  {role:"퍼블리셔",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"Tech Lead",category:"plan",grades:[{g:"초급(2~3년)",r:28220},{g:"중급(4~6년)",r:46480},{g:"중급2(7~8년)",r:64740},{g:"고급(9년+)",r:83000}]},
  {role:"CrossPlatform",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
];

export const GRADE_KEY = {"신입(1년)":"신입","초급(2~3년)":"초급","중급(4~6년)":"중급","중급2(7~8년)":"중급2","고급(9년+)":"고급"};

export const DEFAULT_CATEGORIES = [
  {id:"dev", label:"개발", desc:"Server/Mobile/Web/Data/DevOps"},
  {id:"plan", label:"기획", desc:"PM/기획자/UX/UI/Tech Lead"},
  {id:"qa", label:"QA", desc:"QA 엔지니어"},
  {id:"publisher", label:"퍼블리셔", desc:"퍼블리셔"},
  {id:"rm", label:"RM", desc:"직접 투입 시에만"},
  {id:"other", label:"기타", desc:"기타 직군"},
];
export const CATEGORIES_KEY = "categories";

// POL-PRICING-002
export const AI_DISCOUNT_RATE = 0.30;
export const AI_DURATION_REDUCTION = 0.30;
export const HARNESS_RATE_MULTIPLIER = 0.5;

export const VARIANT_MODES = [
  {value:"ai_h", label:"AI+H (하네스)", desc:"AI Agent + 휴먼 · 기간 30% 단축"},
  {value:"subscription", label:"일반팀", desc:"휴먼 전용 · 표준 기간"},
];
export const CONTRACT_TYPES = [
  {value:"hourly",label:"시급제"},
  {value:"monthly_fixed",label:"월 정액"},
  {value:"short_term",label:"단기"},
];

export const DEFAULT_AI_CONFIG = { token_cap: 1000000 };

export const DEFAULT_PROPOSAL = {
  recipient:"", rm_name:"", project_overview:"", decision_maker:"", collaborators:"",
  ai_config: {...DEFAULT_AI_CONFIG},
  monitoring_subscriptions: [],
  plans: [
    { name: "A안", variants: [{ mode: "subscription", label: "", scope_of_work: [], members: [], total_months: 1, monthly_hours: {} }] }
  ]
};

export const PATTERN_KEY = "proposal_revision_patterns";
export const PATTERN_LIMIT = 20;

export const HARNESS_INDICATOR_COLOR = "#CE93D8";

export const APP_VERSION = "v5.0 · GRIDGE CRM";
