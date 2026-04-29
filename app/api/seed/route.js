import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// POST /api/seed?userId=xxx  — 더미 데이터 시딩 (고객 0명일 때만 실행)
export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const existing = await prisma.customer.count({ where: { userId } });
  if (existing > 0) return NextResponse.json({ ok: true, skipped: true });

  const now = new Date();
  const d = (daysAgo) => { const x = new Date(now); x.setDate(x.getDate() - daysAgo); return x; };

  // ── 고객 7개 ──────────────────────────────────────────────────────────────
  const customers = [
    {
      id: "cu_seed_01",
      company: "㈜뉴미디어랩",
      status: "신규접수",
      industry: "미디어/콘텐츠",
      domain: "영상 콘텐츠 플랫폼",
      contact_name: "김민준",
      contact_title: "CMO",
      phone: "010-1234-5678",
      budget: "3000만원",
      devices: ["웹"],
      worker_types: ["프론트엔드", "백엔드"],
      inquiry_type: "신규개발",
      has_decision_maker: true,
      rm_name: "",
      created_at: d(14).toISOString(),
      last_action_at: d(14).toISOString(),
    },
    {
      id: "cu_seed_02",
      company: "㈜핀테크코어",
      status: "RM배정",
      industry: "금융/핀테크",
      domain: "모바일 결제 시스템",
      contact_name: "이서연",
      contact_title: "CTO",
      phone: "010-2345-6789",
      budget: "5000만원",
      devices: ["모바일 앱", "웹"],
      worker_types: ["백엔드", "iOS", "Android"],
      inquiry_type: "신규개발",
      has_decision_maker: true,
      rm_name: "Robin",
      created_at: d(10).toISOString(),
      last_action_at: d(8).toISOString(),
    },
    {
      id: "cu_seed_03",
      company: "㈜헬스케어AI",
      status: "브리핑완료",
      industry: "헬스케어",
      domain: "AI 의료 진단 솔루션",
      contact_name: "박준혁",
      contact_title: "CPO",
      phone: "010-3456-7890",
      budget: "8000만원",
      devices: ["웹", "태블릿"],
      worker_types: ["풀스택", "AI/ML", "UI/UX"],
      inquiry_type: "신규개발",
      has_decision_maker: true,
      rm_name: "Robin",
      created_at: d(20).toISOString(),
      last_action_at: d(6).toISOString(),
    },
    {
      id: "cu_seed_04",
      company: "㈜에듀테크B2B",
      status: "미팅완료",
      industry: "교육",
      domain: "기업용 LMS 플랫폼",
      contact_name: "최유진",
      contact_title: "대표",
      phone: "010-4567-8901",
      budget: "4000만원",
      devices: ["웹"],
      worker_types: ["프론트엔드", "백엔드", "UI/UX"],
      inquiry_type: "리뉴얼",
      has_decision_maker: true,
      rm_name: "Robin",
      created_at: d(25).toISOString(),
      last_action_at: d(4).toISOString(),
    },
    {
      id: "cu_seed_05",
      company: "㈜테크스타트업",
      status: "RFP",
      industry: "IT/소프트웨어",
      domain: "B2B SaaS 백오피스",
      contact_name: "강도현",
      contact_title: "CTO",
      phone: "010-5678-9012",
      budget: "1억 2000만원",
      devices: ["웹"],
      worker_types: ["풀스택", "DevOps", "PM"],
      inquiry_type: "신규개발",
      has_decision_maker: false,
      rm_name: "Robin",
      created_at: d(35).toISOString(),
      last_action_at: d(2).toISOString(),
    },
    {
      id: "cu_seed_06",
      company: "㈜로지스틱스플로우",
      status: "계약성사",
      industry: "물류/SCM",
      domain: "스마트 물류 관리 시스템",
      contact_name: "한지수",
      contact_title: "대표",
      phone: "010-6789-0123",
      budget: "2억원",
      devices: ["웹", "모바일 앱"],
      worker_types: ["풀스택", "백엔드", "iOS", "Android"],
      inquiry_type: "신규개발",
      has_decision_maker: true,
      rm_name: "Robin",
      created_at: d(60).toISOString(),
      last_action_at: d(1).toISOString(),
    },
    {
      id: "cu_seed_07",
      company: "㈜뷰티플랫폼",
      status: "이탈",
      industry: "뷰티/화장품",
      domain: "D2C 뷰티 커머스",
      contact_name: "오민서",
      contact_title: "마케팅팀장",
      phone: "010-7890-1234",
      budget: "2500만원",
      devices: ["모바일 앱", "웹"],
      worker_types: ["프론트엔드", "백엔드"],
      inquiry_type: "신규개발",
      has_decision_maker: false,
      rm_name: "Robin",
      churn_reason: "예산 부족 및 내부 개발 전환",
      created_at: d(45).toISOString(),
      last_action_at: d(7).toISOString(),
    },
  ];

  // ── 프로젝트 (고객 3~7) ───────────────────────────────────────────────────
  const briefing03 = {
    summary: "헬스케어AI는 B2B 의료기관 대상 AI 진단 보조 솔루션을 개발 중. 예산 8000만원으로 MVP 6개월 목표.",
    company_brief: "2021년 설립, 시리즈A 투자 유치. 주요 고객은 중소 병원 및 의원.",
    predicted_needs: ["AI/ML 개발자 2명", "풀스택 1명", "UI/UX 디자이너 1명"],
    churn_risk: "경쟁사 대비 가격 민감도 높음. 의사결정권자 직접 미팅 필요.",
    checklist: ["NDA 체결 여부 확인", "기술 스택 선호도 파악"],
    questions: ["현재 사용 중인 EMR 시스템은?", "클라우드 환경 제약은?"],
    team_hints: [
      { role: "AI/ML 엔지니어", level: "시니어", count: 2, priority: "must_have" },
      { role: "풀스택 개발자", level: "미드", count: 1, priority: "should_have" },
    ],
  };

  const projects = [
    {
      id: "pr_seed_03",
      customerId: "cu_seed_03",
      title: "AI 의료 진단 보조 플랫폼 개발",
      rmId: userId,
      status: "브리핑완료",
      briefing: JSON.stringify(briefing03),
      requirements: JSON.stringify({
        must_have: [{ id: "r1", source: "briefing", text: "AI/ML 엔지니어 시니어 2명 필요", status: "AI추론", phase: 1 }],
        should_have: [],
        nice_to_have: [],
        open_questions: ["현재 EMR 시스템 연동 여부?"],
        team_hints: briefing03.team_hints,
      }),
      created_at: d(19).toISOString(),
    },
    {
      id: "pr_seed_04",
      customerId: "cu_seed_04",
      title: "기업용 LMS 플랫폼 리뉴얼",
      rmId: userId,
      status: "미팅완료",
      requirements: JSON.stringify({
        must_have: [
          { id: "r1", source: "consultation", text: "SCORM 콘텐츠 호환성 필수", status: "RM확정", phase: 1 },
          { id: "r2", source: "consultation", text: "관리자 대시보드 통계 기능", status: "AI추론", phase: 1 },
        ],
        should_have: [{ id: "r3", source: "consultation", text: "모바일 웹 반응형", status: "AI추론", phase: 2 }],
        nice_to_have: [],
        open_questions: [],
        team_hints: [],
      }),
      created_at: d(24).toISOString(),
    },
    {
      id: "pr_seed_05",
      customerId: "cu_seed_05",
      title: "B2B SaaS 백오피스 플랫폼 신규 개발",
      rmId: userId,
      status: "RFP",
      rfp_doc1: JSON.stringify({
        overview: "SaaS 형태의 B2B 백오피스 플랫폼. 멀티테넌시 지원, 6개월 MVP 목표.",
        functional_requirements: [
          { id: "FR-APP-01", category: "계정관리", desc: "멀티테넌시 계정/권한 관리", priority: "필수", phase: 1 },
          { id: "FR-APP-02", category: "데이터", desc: "실시간 대시보드 및 리포트", priority: "필수", phase: 1 },
          { id: "FR-APP-03", category: "연동", desc: "외부 ERP API 연동", priority: "권장", phase: 2 },
        ],
        tech_stack: "React + Node.js, PostgreSQL, AWS",
        open_questions: ["기존 ERP 시스템 종류는?"],
      }),
      rfp_doc2: JSON.stringify({
        overview: "풀스택 3명 + DevOps 1명 구성, 6개월 계약",
        team_a: [
          { role: "풀스택 개발자", level: "시니어", count: 2, hourly_rate: 55000, weekly_hours: 40, duration_months: 6 },
          { role: "DevOps", level: "미드", count: 1, hourly_rate: 45000, weekly_hours: 40, duration_months: 6 },
        ],
        team_b_harness: true,
      }),
      created_at: d(34).toISOString(),
    },
    {
      id: "pr_seed_06",
      customerId: "cu_seed_06",
      title: "스마트 물류 관리 시스템 개발",
      rmId: userId,
      status: "계약성사",
      contract_signed: true,
      created_at: d(58).toISOString(),
    },
    {
      id: "pr_seed_07",
      customerId: "cu_seed_07",
      title: "D2C 뷰티 커머스 앱 개발",
      rmId: userId,
      status: "이탈",
      created_at: d(43).toISOString(),
    },
  ];

  // ── 상담 노트 (고객 4, 5, 6) ──────────────────────────────────────────────
  const notes = [
    // 에듀테크B2B (cu_seed_04) — 미팅완료
    {
      id: "note_04_1",
      customerId: "cu_seed_04",
      projectId: "pr_seed_04",
      seq: 1,
      date: d(10).toISOString(),
      content: "1차 미팅 완료. SCORM 호환 및 관리자 대시보드 요구사항 확인. 모바일 반응형은 2차 스프린트로 협의.",
      pain_points: "기존 LMS UI가 낙후됨, 학습 완료율 통계 필요",
      next_action: "RFP 문서 준비 및 견적 제안",
      rm_confirmed: true,
    },
    // 테크스타트업 (cu_seed_05) — RFP
    {
      id: "note_05_1",
      customerId: "cu_seed_05",
      projectId: "pr_seed_05",
      seq: 1,
      date: d(15).toISOString(),
      content: "1차 미팅. 멀티테넌시 SaaS 아키텍처 필수. ERP 연동은 2단계. 6개월 MVP 일정 확인.",
      pain_points: "현재 수작업 프로세스, 데이터 사일로 문제",
      next_action: "아키텍처 방안 검토",
      rm_confirmed: true,
    },
    {
      id: "note_05_2",
      customerId: "cu_seed_05",
      projectId: "pr_seed_05",
      seq: 2,
      date: d(8).toISOString(),
      content: "2차 미팅. 기술 스택 React+Node 확정. AWS 인프라 선호. 의사결정권자 다음 미팅 참여 예정.",
      pain_points: "내부 개발팀 없음, 장기적으로 유지보수 팀 전환 고려",
      next_action: "RFP 초안 공유",
      rm_confirmed: true,
    },
    // 로지스틱스플로우 (cu_seed_06) — 계약성사
    {
      id: "note_06_1",
      customerId: "cu_seed_06",
      projectId: "pr_seed_06",
      seq: 1,
      date: d(40).toISOString(),
      content: "1차 미팅. 물류 추적 실시간화, 모바일 기사 앱 필요. 2억원 예산 확인.",
      pain_points: "엑셀 기반 수기 관리, 실시간 가시성 부재",
      next_action: "팀 구성 제안 준비",
      rm_confirmed: true,
    },
    {
      id: "note_06_2",
      customerId: "cu_seed_06",
      projectId: "pr_seed_06",
      seq: 2,
      date: d(25).toISOString(),
      content: "RFP 발표 완료. A안 선택. 계약 조건 협의.",
      pain_points: "",
      next_action: "계약서 작성 및 킥오프 일정 조율",
      rm_confirmed: true,
    },
  ];

  // ── 계약 (cu_seed_06) ────────────────────────────────────────────────────
  const contract = {
    id: "contract_seed_06",
    userId,
    projectId: "pr_seed_06",
    customerId: "cu_seed_06",
    data: JSON.stringify({
      company: "㈜로지스틱스플로우",
      title: "스마트 물류 관리 시스템 개발",
      amount: "2억원",
      duration_months: 8,
      start_date: d(5).toISOString(),
      end_date: (() => { const x = new Date(now); x.setMonth(x.getMonth() + 7); return x.toISOString(); })(),
      team: [
        { role: "풀스택 개발자", count: 2, level: "시니어" },
        { role: "백엔드 개발자", count: 1, level: "미드" },
        { role: "iOS 개발자", count: 1, level: "미드" },
        { role: "Android 개발자", count: 1, level: "미드" },
      ],
      status: "진행중",
    }),
  };

  // ── 유사 사례 (cu_seed_06 기반) ──────────────────────────────────────────
  const similarCase = {
    id: "sc_seed_06",
    userId,
    data: JSON.stringify({
      source_company: "㈜로지스틱스플로우",
      source_project: "스마트 물류 관리 시스템",
      industry: "물류/SCM",
      domain: "스마트 물류 관리",
      budget: "2억원",
      duration_months: 8,
      team_size: 5,
      tech_stack: "React Native, Node.js, PostgreSQL, AWS",
      outcome: "계약성사",
      contract_signed: true,
      notes: "A안(일반) 선택. 실시간 추적 + 기사 앱 MVP 6개월, 유지보수 2개월 포함.",
    }),
  };

  // ── DB 트랜잭션 ───────────────────────────────────────────────────────────
  await prisma.$transaction(async (tx) => {
    // 고객
    await tx.customer.createMany({
      data: customers.map(c => ({
        id: c.id,
        userId,
        data: JSON.stringify(c),
        status: c.status,
        company: c.company,
        createdAt: new Date(c.created_at),
        lastActionAt: new Date(c.last_action_at),
      })),
    });

    // 프로젝트
    await tx.project.createMany({
      data: projects.map(p => {
        const { id, customerId, title, rmId, status, created_at, ...rest } = p;
        return {
          id,
          customerId,
          title,
          rmId: rmId || null,
          status: status || "신규접수",
          data: JSON.stringify(rest),
          createdAt: created_at ? new Date(created_at) : new Date(),
        };
      }),
    });

    // 노트
    await tx.note.createMany({
      data: notes.map(n => ({
        id: n.id,
        customerId: n.customerId,
        projectId: n.projectId || null,
        seq: n.seq,
        data: JSON.stringify(n),
      })),
    });

    // 계약
    await tx.contract.create({ data: contract });

    // 유사 사례
    await tx.similarCase.create({ data: similarCase });
  });

  return NextResponse.json({ ok: true, seeded: customers.length });
}
