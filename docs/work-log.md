# 작업 로그

## 2026-03-17

### 완료된 작업

#### 1. 아키텍처 구성도 작성
- `backend/docs/architecture-diagram.md` — 백엔드 중심 Mermaid 구성도 (5개 다이어그램)

#### 2. 인수인계 문서 작성
- `backend/docs/backend-architecture.md` — 백엔드 상세 아키텍처 (12개 섹션)
  - 기술 스택, 프로젝트 구조, 모듈별 상세, 트랜잭션 패턴
  - ERD, 전체 API 엔드포인트 목록, 미완성 항목 포함

#### 3. 문서 관리 규칙 추가
- `backend/CLAUDE.md` — 작업 관련 `.md` 문서는 반드시 `docs/`에 저장 규칙 추가

---

### 미완료 / 이후 작업

| 항목 | 우선순위 | 내용 |
|------|---------|------|
| JWT Secret 환경변수화 | 높음 | `'secret_key'` → `process.env.JWT_SECRET` |
| CommentModule 구현 | 중간 | Service + Controller + 엔드포인트 설계 |
| 프로덕션 마이그레이션 설정 | 높음 | `synchronize: false` 전환 |
