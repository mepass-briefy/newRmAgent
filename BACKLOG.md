# Backlog — 운영 전환 시 필수

> 현재(v2 셋업 직후)는 POC 동작 검증 단계. 아래는 **운영 전환 전 반드시 처리해야 하는** 항목들.
> 지금은 진행하지 않음. 사용자가 별도 요청 시 시작.

## 1. `_core/RmAppCore.jsx`에서 컴포넌트 진짜 분리

**현 상태**: 원본 `rm_work_board_v2.jsx`의 line 582–3687을 통째로 `app/components/_core/RmAppCore.jsx`로 옮긴 뒤, 사용자 디렉터리 구조의 파일들(`Dashboard.jsx`, `Customers.jsx`, `Consulting.jsx`, `Contract.jsx`, `Workers.jsx`, `Settings.jsx`)이 named re-export로 노출하는 형태.

**해야 할 일**:
- `TeamBuildingDetail` (가장 큰 모듈, ~1,500줄)을 진짜 파일로 분리
- `ModeSelectDialog` / `HoursReviewModal` / `RevisionReasonDialog` / `ProposalEditForm` / `ProposalPreview` / `VariantEditor` / `VariantCard` / `MonitoringSubsPanel` 등 sub-component들을 적절히 한 파일에 묶거나 분리
- `ConsultNotes`, `BriefingDetail`을 `Consulting.jsx` 옆에 분리
- `NewCustomerForm`, `CustomerDetail`을 `Customers.jsx` 옆에 분리
- `RMSelector`, `MdBlock`, `renderInline`을 `app/components/ui/` 또는 `app/lib/`로 이동
- `PROPOSAL_SYSTEM`, `ANALYSIS_SYSTEM`, `BRIEFING_SYSTEM`을 `app/lib/prompts.js`로 이동
- 분리 끝나면 `_core/` 폴더와 `scripts/build-core.js` 삭제

**우선순위**: 높음 (코드 가독성·점진적 변경 용이성)

## 2. Prisma 마이그레이션 파일 생성

**현 상태**: `prisma db push`만 사용. 마이그레이션 히스토리 없음.

**해야 할 일**:
- `npx prisma migrate dev --name init`으로 초기 마이그레이션 생성
- `prisma/migrations/` 디렉터리를 git 추적
- 운영 환경의 `DATABASE_URL`을 PostgreSQL 등으로 교체
- 배포 파이프라인에 `prisma migrate deploy` 추가

**우선순위**: 높음 (운영 시 스키마 변경 추적 필수)

## 3. 비밀번호 해싱 + 세션 만료 + httpOnly 쿠키

**현 상태** (POC 수준):
- 비밀번호 평문 저장 (`TeamMember.password`)
- 세션 만료 없음 (쿠키 maxAge 30일이지만 서버 검증 없음)
- 쿠키 `httpOnly: false` — 클라이언트에서 userId 읽기 가능 (XSS 노출)
- 로그인 검증이 클라이언트 (`Login.jsx`)에서 이루어짐

**해야 할 일**:
- `bcrypt` 도입 → `TeamMember.password`를 해시로 저장
- `/api/auth/login` 신규: 서버에서 비교
- 세션 토큰 별도 저장 (DB의 `Session` 테이블 + 만료 타임스탬프)
- 쿠키 `httpOnly: true`, `secure: true`(HTTPS), `sameSite: "lax"`
- `/api/auth/me` 엔드포인트 신설(쿠키 → userId → 사용자 정보 반환)
- ACC-AUTH-004 (계정시스템.md) 항목 갱신

**우선순위**: 매우 높음 (외부 노출 시 즉시 보안 사고)

## 4. 동시 멀티 사용자 락/병합 정책

**현 상태**: ACC-DATA-002에 명시되어 있듯 "단일 기기 단일 세션 운영" 가정. 두 RM이 동시에 같은 고객을 편집하면 마지막 저장이 덮어씀.

**해야 할 일**:
- `Customer` / `Note` 모델에 `version` 또는 `updatedAt` 필드 추가
- PUT 시 클라이언트가 가져온 버전과 DB 버전 비교 (낙관적 락)
- 충돌 시 409 응답 + 클라이언트에서 병합 다이얼로그
- 또는: 실시간 협업이 필요하다면 Yjs/Automerge 같은 CRDT 도입 검토
- 동시 편집 정책을 ACC-DATA-002 / REQ-DATAMODEL-001에 명시

**우선순위**: 중간 (실제 멀티 사용자 사용 시작 직전)

---

## 비고

- 항목 4는 항목 3 이후에 진행 (인증이 먼저 안정화돼야 함)
- 항목 1은 다른 항목들과 무관하게 언제든 진행 가능
- 항목 2는 운영 전환 결정 시점에 진행
