"use client";
// 디자인 토큰, 데이터 모델 상수, 기본값 — DS-COLOR-* / REQ-* / POL-* 참조

export const FONT_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";

// DS-COLOR-001 / DS-COLOR-002
export const H = {
  light: { bg:"#F7F7F8",bg2:"#EEEEF0",card:"#FFFFFF",cardBorder:"rgba(20,20,30,0.08)",cardShadow:"0 1px 3px rgba(0,0,0,0.04)",text:"#1F2328",textSub:"#6B7280",textHint:"#9CA3AF",brand:"#4A5CE0",brandLight:"#F0F1F8",brandDark:"#3847B8",inputBg:"#FFFFFF",inputBorder:"#E5E7EB",divider:"#EDEEF0",
    sNew:{bg:"#EEF0F5",color:"#3B4A6B",dot:"#4A5CE0"},sRM:{bg:"#EAF1F5",color:"#2C5A7A",dot:"#5AA1C3"},sBrief:{bg:"#EEF4F0",color:"#2D5A42",dot:"#5BA87C"},sMeeting:{bg:"#F5EFE8",color:"#7A4B2B",dot:"#C9915C"},sTeam:{bg:"#F0EEF5",color:"#4A3D7A",dot:"#9B87C9"},sWon:{bg:"#EDF4EF",color:"#2C5A2E",dot:"#5BA05E"},sLost:{bg:"#F5ECEC",color:"#7A3838",dot:"#C25656"} },
  dark: { bg:"#1C1D22",bg2:"#28292C",card:"#28292C",cardBorder:"rgba(255,255,255,0.07)",cardShadow:"0 2px 16px 0 rgba(0,0,0,0.45)",text:"#F1F3F5",textSub:"#868E96",textHint:"#495057",brand:"#5C7CFA",brandLight:"rgba(92,124,250,0.16)",brandDark:"#3451D1",inputBg:"#383B41",inputBorder:"rgba(255,255,255,0.10)",divider:"rgba(255,255,255,0.07)",
    sNew:{bg:"rgba(76,110,245,0.15)",color:"#91A7FF",dot:"#5C7CFA"},sRM:{bg:"rgba(56,189,248,0.12)",color:"#7DD3FC",dot:"#38BDF8"},sBrief:{bg:"rgba(52,211,153,0.12)",color:"#6EE7B7",dot:"#34D399"},sMeeting:{bg:"rgba(251,146,60,0.12)",color:"#FED7AA",dot:"#FB923C"},sTeam:{bg:"rgba(167,139,250,0.14)",color:"#C4B5FD",dot:"#A78BFA"},sWon:{bg:"rgba(55,178,77,0.13)",color:"#86EFAC",dot:"#37B24D"},sLost:{bg:"rgba(250,82,82,0.13)",color:"#FCA5A5",dot:"#FA5252"} },
};

export const STATUS_MAP = {"신규접수":{key:"sNew"},"RM배정":{key:"sRM"},"브리핑완료":{key:"sBrief"},"미팅완료":{key:"sMeeting"},"팀빌딩검토":{key:"sTeam"},"계약성사":{key:"sWon"},"이탈":{key:"sLost"}};
export const STAGE_ORDER = ["신규접수","RM배정","브리핑완료","미팅완료","팀빌딩검토","계약성사","이탈"];
export const STATUSES = ["신규접수","RM배정","브리핑완료","미팅완료","팀빌딩검토","계약성사","이탈"];
export const INDUSTRIES = ["핀테크","헬스케어","이커머스","에듀테크","물류","SaaS","제조","미디어","부동산","기타"];
export const DEVICES = ["웹(PC)","웹(모바일)","안드로이드앱","iOS앱","기타"];
export const WORKER_TYPES = ["개발자","디자이너","기획자","QA엔지니어","데이터분석가","DevOps","기타"];
export const GRADE_ORDER = ["신입(1년)","초급(2~3년)","중급(4~6년)","중급2(7~8년)","고급(9년+)"];
export const ROLES = ["Junior RM","Mid RM","Senior RM","팀장","관리자"];
export const DEFAULT_PERMS = {customers:{RM:true,팀장:true,관리자:true},consulting:{RM:true,팀장:true,관리자:true},contract:{RM:false,팀장:true,관리자:true},workers:{RM:true,팀장:true,관리자:true}};
export const MENU_LABELS = {customers:"고객관리",consulting:"상담관리",contract:"계약관리",workers:"작업자관리"};

// REQ-WORKER-002 기본 직무
export const DEFAULT_RATES = [
  {role:"프로젝트 매니저",category:"plan",grades:[{g:"초급(2~3년)",r:28220},{g:"중급(4~6년)",r:46480},{g:"중급2(7~8년)",r:64740},{g:"고급(9년+)",r:83000}]},
  {role:"기획자",category:"plan",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:26560},{g:"중급(4~6년)",r:43160},{g:"중급2(7~8년)",r:63080},{g:"고급(9년+)",r:83000}]},
  {role:"UX/UI 디자이너",category:"plan",grades:[{g:"신입(1년)",r:24900},{g:"초급(2~3년)",r:28220},{g:"중급(4~6년)",r:33200},{g:"중급2(7~8년)",r:45650},{g:"고급(9년+)",r:58100}]},
  {role:"Web 개발자",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"Server 개발자",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"Mobile 개발자",category:"dev",grades:[{g:"신입(1년)",r:20750},{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:38180},{g:"중급2(7~8년)",r:56440},{g:"고급(9년+)",r:74700}]},
  {role:"QA 엔지니어",category:"qa",grades:[{g:"초급(2~3년)",r:24900},{g:"중급(4~6년)",r:33200},{g:"중급2(7~8년)",r:37350},{g:"고급(9년+)",r:41500}]},
];

export const DEFAULT_CATEGORIES = [
  {id:"dev", label:"개발", desc:"Server/Mobile/Web/Data/DevOps"},
  {id:"plan", label:"기획", desc:"PM/기획자/UX/UI/Tech Lead"},
  {id:"qa", label:"QA", desc:"QA 엔지니어"},
  {id:"publisher", label:"퍼블리셔", desc:"퍼블리셔"},
  {id:"rm", label:"RM", desc:"직접 투입 시에만"},
  {id:"other", label:"기타", desc:"기타 직군"},
];
export const CATEGORIES_KEY = "categories";

// POL-PRICING-002 / POL-PRICING-006
export const AI_DISCOUNT_RATE = 0.30;       // AI+H: 일반 멤버 30% 절감
export const AI_DURATION_REDUCTION = 0.30;  // AI+H: 기간 30% 단축
export const HARNESS_RATE_MULTIPLIER = 0.5; // 하네스 멤버: 시급 50%

// REQ-PROPOSAL-001
export const VARIANT_MODES = [
  {value:"ai_h", label:"AI+H", desc:"AI Agent + 휴먼 · 기간 30% 단축"},
  {value:"subscription", label:"구독작업자", desc:"휴먼 전용 · 표준 기간"},
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

// REQ-AI-005
export const PATTERN_KEY = "proposal_revision_patterns";
export const PATTERN_LIMIT = 20;

// DS-COLOR-002 하네스 인디케이터
export const HARNESS_INDICATOR_COLOR = "#9B87C9";

export const APP_VERSION = "v4.3 · Next.js + SQLite";
