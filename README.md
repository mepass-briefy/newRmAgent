# GRIDGE RM CRM v2 — Next.js + SQLite

GRIDGE RM의 단일 파일 React 앱(`crm_rm/rm_work_board_v2.jsx`)을 Next.js + Prisma + SQLite 환경으로 이전한 버전.

## 기술 스택

- Next.js 14 (App Router) + React 18
- Prisma 5 + SQLite (`prisma/dev.db`)
- 단일 인증: 쿠키에 `userId` 저장 (POC 수준; 운영 시 해싱·세션 만료 등 보강 필요)
- AI: Anthropic Messages API — 키는 `.env`의 `ANTHROPIC_API_KEY`만 서버 측에 보관

## 디렉터리 구조

```
crm_rm_v2/
├── app/
│   ├── api/                  # Next.js Route Handlers (서버측)
│   │   ├── auth/session/     # GET·PUT·DELETE  (쿠키 세션)
│   │   ├── customers/        # GET·PUT (?userId=...)
│   │   ├── notes/[customerId]/
│   │   ├── rates/, categories/, teams/, perms/, patterns/
│   │   ├── ai/               # POST  (Anthropic 프록시)
│   │   └── _dump/            # GET (전체 export), POST (가져오기)
│   ├── components/           # 분리된 클라이언트 컴포넌트
│   ├── lib/                  # prisma/store/ai/context/constants/utils/session
│   ├── layout.jsx, page.jsx
├── prisma/
│   ├── schema.prisma
│   └── dev.db                # SQLite 파일 (백업 시 이 파일만 복사)
├── docs/                     # 스펙 MD 5종 (v1 그대로)
├── scripts/
│   └── import-from-json.js   # v1 백업 JSON → SQLite 주입
└── package.json
```

## 실행

```bash
npm install
npm run db:push       # 최초 1회: schema → dev.db 생성
npm run dev           # http://localhost:3000
```

## DB 위치 / 백업

- 파일: `prisma/dev.db`
- 백업: `dev.db` 파일 자체를 복사하면 끝.
- 복원: 같은 위치에 덮어쓰면 됨.

운영 환경에서는 `DATABASE_URL`을 PostgreSQL 등으로 변경하고 `npm run db:push`를 다시 돌리면 된다.

## 데이터 import / export

### Export (전체)

```bash
curl http://localhost:3000/api/dump > backup.json
```

또는 앱 내 **설정 → 데이터** 탭에서 "📤 내보내기".

### Import (v1 JSON → 새 SQLite로 주입)

```bash
node scripts/import-from-json.js backup.json           # 병합 (기본)
node scripts/import-from-json.js backup.json --reset   # 전체 교체
```

JSON 형식은 v1의 `store.list/get` 결과 그대로:

```json
{
  "teams": [...],
  "rates": [...],
  "categories": [...],
  "perms": { "customers": {"RM": true, ...}, ... },
  "proposal_revision_patterns": [...],
  "customers:{userId}": [...],
  "notes:{customerId}": [...]
}
```

## 환경 변수 (`.env`)

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=sk-ant-...
```

`ANTHROPIC_API_KEY`가 비어 있으면 AI 기능(회의록 분석 / 브리핑 / 제안서 생성·재제안 / 패턴 유사도 판정)은 모두 500을 반환한다. 그 외 화면은 정상 동작.

## docs/

비즈니스 정책·요구사항·디자인 시스템·계정 시스템·문서 맵 — v1과 동일한 5개 MD. 시작점은 `docs/MAP.md`. 각 ID(`REQ-*`, `POL-*`, `ACC-*`, `DS-*`)는 변경되어도 재명명되지 않으며, 코드 변경은 반드시 해당 ID 섹션을 함께 갱신하는 것이 규칙이다.

## 알려진 제약 (POC)

- 비밀번호 평문 저장 (ACC-AUTH-004)
- 세션 만료 없음
- httpOnly가 false인 쿠키 — 클라이언트에서 userId 읽기 가능 (운영 시 separate /api/me 필요)
- `prisma db push`만 사용 (마이그레이션 파일 없음). 운영 전 `prisma migrate dev`로 전환 권장.
