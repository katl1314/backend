# Backend 아키텍처 — dev.log 인수인계 문서

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [진입점 & 글로벌 설정](#4-진입점--글로벌-설정)
5. [모듈별 상세](#5-모듈별-상세)
6. [공통 유틸리티](#6-공통-유틸리티)
7. [인증 & 가드](#7-인증--가드)
8. [트랜잭션 처리 패턴](#8-트랜잭션-처리-패턴)
9. [데이터베이스 스키마](#9-데이터베이스-스키마)
10. [API 엔드포인트 전체 목록](#10-api-엔드포인트-전체-목록)
11. [환경 변수](#11-환경-변수)
12. [미완성 항목 & TODO](#12-미완성-항목--todo)

---

## 1. 프로젝트 개요

dev.log 블로그 플랫폼의 REST API 서버.
프론트엔드(`http://localhost:3000`)의 요청을 처리하며, PostgreSQL에 데이터를 저장한다.

- **포트**: `3001`
- **CORS 허용 Origin**: `http://localhost:3000`
- **DB**: PostgreSQL (`localhost:5432`)
- **실행 명령**: `npm run start:dev` (watch 모드)

---

## 2. 기술 스택

| 항목 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | NestJS | v11 | REST API 서버 |
| 언어 | TypeScript | - | 타입 안전성 |
| 데이터베이스 | PostgreSQL | - | 메인 데이터 저장소 (포트 5432) |
| ORM | TypeORM | v0.3 | DB 연결 및 엔티티 관리 |
| 인증 | JWT | - | Access Token + Refresh Token |
| 비밀번호 해싱 | bcrypt | - | 이메일/비밀번호 로그인 시 해시 처리 |
| 환경변수 | @nestjs/config | - | `.env.local` 로드 |

---

## 3. 프로젝트 구조

```
src/
├── main.ts                             # 앱 진입점
│                                       #  - CORS: http://localhost:3000
│                                       #  - 글로벌 HttpExceptionFilter 등록
│                                       #  - 포트: 3001
├── app.module.ts                       # 루트 모듈
│                                       #  - ConfigModule (.env.local)
│                                       #  - TypeOrmModule (PostgreSQL, synchronize: true)
│                                       #  - 각 기능 모듈 등록
├── app.controller.ts
├── app.service.ts
│
├── auth/                               # 인증 모듈
│   ├── auth.controller.ts              # /auth/* 엔드포인트
│   ├── auth.service.ts                 # 유저 CRUD, JWT 발급, bcrypt 비밀번호 검증
│   ├── auth.module.ts
│   ├── entity/
│   │   └── user.entity.ts              # UserModel
│   ├── guard/
│   │   ├── bearer-token.guard.ts       # JWT 추출 & 검증 기반 추상 가드
│   │   ├── access-token.guard.ts       # AccessToken 검증 (BearerTokenGuard 상속)
│   │   └── refresh-token.guard.ts      # RefreshToken 검증 (BearerTokenGuard 상속)
│   └── dto/
│       └── create-user-dto.ts
│
├── blog/                               # 블로그 모듈 (컨트롤러 없음)
│   ├── blog.service.ts                 # createBlog() — AuthService에서만 호출
│   ├── blog.module.ts
│   ├── entity/
│   │   └── blog.entity.ts              # BlogModel
│   └── dto/
│       └── create-blog-dto.ts
│
├── post/                               # 포스트 모듈
│   ├── post.controller.ts              # /post/* 엔드포인트
│   ├── post.service.ts                 # 포스트 CRUD, 좋아요 처리, 커서 페이지네이션
│   ├── post.module.ts
│   ├── entity/
│   │   ├── post.entity.ts              # PostModel (soft delete)
│   │   └── post_like.entity.ts         # PostLikeModel
│   └── dto/
│       └── create-post.dto.ts
│
├── comment/                            # 댓글 모듈 (WIP)
│   ├── comment.controller.ts           # /comment/* (구현 없음)
│   ├── comment.module.ts
│   └── entity/
│       └── comment.entity.ts           # CommentModel (level + pid 중첩 구조)
│
├── tag/                                # 태그 모듈 (WIP)
│   ├── tag.module.ts
│   └── entity/
│       └── tag.entity.ts               # TagModel (Post와 ManyToMany)
│
└── common/                             # 공통 유틸리티 모듈
    ├── common.service.ts               # cursorPaginate()
    ├── common.module.ts
    ├── decorator/
    │   └── query-runner.decorator.ts   # @QueryRunnerDeco() 파라미터 데코레이터
    ├── interceptor/
    │   └── transaction.interceptor.ts  # QueryRunner 생성 & 트랜잭션 라이프사이클
    ├── exception-filter/
    │   └── http.exception.ts           # 전역 HTTP 예외 필터
    └── util/
        └── util.ts
```

---

## 4. 진입점 & 글로벌 설정

### `main.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:3000' });
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3001);
}
```

### `app.module.ts`

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.local', isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,   // ⚠️ 개발 전용 — 프로덕션에서는 false + 마이그레이션 사용
      entities: [UserModel, BlogModel, PostModel, CommentModel, PostLikeModel, TagModel],
    }),
    AuthModule, BlogModule, PostModule, CommentModule, TagModule, CommonModule,
  ],
})
```

---

## 5. 모듈별 상세

### Auth 모듈 (`/auth`)

유저 인증 및 JWT 발급을 담당한다. 유저 생성 시 BlogModule을 트랜잭션으로 함께 호출한다.

#### 엔드포인트

| Method | Path | Guard | 설명 |
|--------|------|-------|------|
| POST | `/auth/signIn` | - | 이메일/provider 기반 로그인, Access+Refresh Token 반환 |
| POST | `/auth/access` | RefreshTokenGuard | Refresh Token → Access Token 갱신 |
| GET | `/auth/users` | - | 전체 유저 목록 조회 |
| GET | `/auth/users/:userId` | - | UUID로 유저 조회 |
| GET | `/auth/users/:email/exists` | - | 이메일 존재 여부 (`{ exists: boolean }`) |
| GET | `/auth/users/email/:email` | - | 이메일로 유저 조회 |
| POST | `/auth/users` | TransactionInterceptor | 유저 + 블로그 동시 생성 |

#### UserEntity 주요 필드

```typescript
@Entity()
export class UserModel {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column({ unique: true, length: 20 })
  user_id: string           // 로그인 ID / URL 경로 식별자

  @Column({ unique: true, length: 20 })
  user_name: string         // 화면 표시 이름

  @Column({ nullable: true })
  avatar_url: string        // 프로필 이미지 URL

  @Column({ nullable: true })
  password: string          // bcrypt 해시 (OAuth 유저는 null)

  @Column({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus        // ACTIVE | BLOCKED | WITHDRAWN

  @Column({ enum: Provider, default: Provider.EMAIL })
  provider: Provider        // EMAIL | GOOGLE | GITHUB

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
```

#### 토큰 정책

| 항목 | 값 |
|------|-----|
| Access Token 만료 | `60 × 24 × 24`초 ≈ 24시간 |
| Refresh Token 만료 | `60 × 60 × 24 × 30`초 = 30일 |
| JWT Secret | `'secret_key'` (**⚠️ 환경변수 이전 필요**) |
| 발급 방식 | `payload: { id, email, type: 'access' | 'refresh' }` |

---

### Blog 모듈

**컨트롤러 없음.** 유저 생성 트랜잭션에서 `AuthService` → `BlogService.createBlog()`로만 호출된다.

#### BlogEntity 주요 필드

```typescript
@Entity()
export class BlogModel {
  @PrimaryGeneratedColumn('uuid') id: string

  @OneToOne(() => UserModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserModel           // 유저 삭제 시 블로그도 cascade 삭제

  @Column({ nullable: true })
  url_slug: string          // 블로그 고유 슬러그 (기본값: user_id)

  @Column({ length: 40, nullable: true })
  title: string

  @Column({ length: 100, nullable: true })
  description: string
}
```

---

### Post 모듈 (`/post`)

포스트 CRUD 및 좋아요 기능을 담당한다.

#### 엔드포인트

| Method | Path | Guard | 설명 |
|--------|------|-------|------|
| POST | `/post` | AccessTokenGuard + TransactionInterceptor | 포스트 생성 |
| GET | `/post?cursor=num` | - | 포스트 목록 (커서 페이지네이션) |
| GET | `/post/:userId/:path` | - | 포스트 상세 조회 |
| POST | `/post/like/:postId` | AccessTokenGuard | 좋아요 추가 |
| DELETE | `/post/like/:postId` | AccessTokenGuard | 좋아요 취소 |

#### PostEntity 주요 필드

```typescript
@Entity()
export class PostModel {
  @PrimaryGeneratedColumn()
  id: number                // auto-increment (커서 페이지네이션 기준값)

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'user_id' })
  user: UserModel

  @Column()
  path: string              // URL 슬러그 (user_id와 복합 unique 제약)

  @Column() title: string

  @Column({ length: 100, nullable: true })
  summary: string

  @Column('text') content: string

  @Column({ nullable: true }) thumbnail: string

  @Column({ default: 'draft' }) status: string

  @Column({ default: true }) visibility: boolean

  @DeleteDateColumn() deleted_at: Date   // soft delete (null이면 활성)

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
```

#### PostLikeEntity

```typescript
@Entity()
@Unique(['user', 'post'])       // 동일 유저-포스트 중복 좋아요 방지
export class PostLikeModel {
  @PrimaryGeneratedColumn('uuid') id: string

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  user: UserModel

  @ManyToOne(() => PostModel, { onDelete: 'CASCADE' })
  post: PostModel
}
```

---

### Comment 모듈 (`/comment`) — WIP

Entity만 정의되어 있으며 Service, Controller 로직은 미구현 상태다.

#### CommentEntity 주요 필드

```typescript
@Entity()
export class CommentModel {
  @PrimaryGeneratedColumn('uuid') id: string

  @ManyToOne(() => PostModel)
  post: PostModel

  @ManyToOne(() => UserModel)
  user: UserModel

  @Column({ length: 100 }) content: string

  @Column({ default: 0 })
  level: number             // 중첩 깊이 (0 = 최상위, 1 = 대댓글)

  @Column({ nullable: true, type: 'uuid' })
  pid: string               // 부모 댓글 ID (최상위 댓글은 null)

  @DeleteDateColumn() deleted_at: Date

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
```

---

### Tag 모듈— WIP

```typescript
@Entity()
export class TagModel {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column({ unique: true }) name: string

  @ManyToMany(() => PostModel, post => post.tags)
  posts: PostModel[]        // post_tags 중간 테이블로 Post와 연결
}
```

---

## 6. 공통 유틸리티

### `TransactionInterceptor`

`@UseInterceptors(TransactionInterceptor)` 로 컨트롤러/메서드에 적용.

```
실행 순서:
1. DataSource에서 QueryRunner 생성
2. DB 연결 + 트랜잭션 시작 (queryRunner.startTransaction())
3. request.queryRunner에 QR 주입
4. next.handle() — 핸들러 실행 (Controller → Service)
5. 성공 → queryRunner.commitTransaction()
6. 에러 → queryRunner.rollbackTransaction() + 예외 재throw
7. 최종 → queryRunner.release()
```

### `HttpExceptionFilter`

`main.ts`에서 `app.useGlobalFilters()`로 전역 등록.

```json
// 에러 응답 포맷
{
  "statusCode": 400,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/auth/signIn",
  "error": "에러 메시지"
}
```

### `CommonService.cursorPaginate()`

```typescript
cursorPaginate<T>(
  dto: CursorPaginationDto,          // { cursor?: number, take: number }
  qb: SelectQueryBuilder<T>,
  alias: string
): Promise<{
  data: T[],
  hasNext: boolean,
  cursor: { after: number },
  count: number
}>
```

**동작 원리:**
- `id DESC` 정렬 (최신순)
- `take + 1`개 조회 → `take`개 초과 시 `hasNext: true`, 초과분 제거
- `cursor.after` 기준으로 `id < after` WHERE 조건 추가

---

## 7. 인증 & 가드

### 가드 계층 구조

```
BearerTokenGuard (추상 가드)
├── AccessTokenGuard   — type === 'access' 검증
└── RefreshTokenGuard  — type === 'refresh' 검증
```

### 동작 방식

```
1. Authorization 헤더에서 'Bearer <token>' 추출
2. JWT 디코드 → payload.type 확인 ('access' | 'refresh')
3. 타입 불일치 → 401 UnauthorizedException
4. JWT 서명 검증 (secret_key)
5. 검증 성공:
   - request.user = 유저 엔티티
   - request.tokenInfo = 토큰 메타 정보
```

### 컨트롤러에서 유저 정보 접근

```typescript
@Get('me')
@UseGuards(AccessTokenGuard)
getMe(@Req() req: Request) {
  const user: UserModel = req['user']
}
```

---

## 8. 트랜잭션 처리 패턴

**핵심 규칙**: `qr.manager.getRepository()`로 얻은 레포지토리만 해당 트랜잭션에 참여한다.
`@InjectRepository()`로 주입된 일반 레포지토리는 트랜잭션 밖에서 동작한다.

### 컨트롤러

```typescript
@Post('users')
@UseInterceptors(TransactionInterceptor)
async createUser(
  @Body() dto: CreateUserDto,
  @QueryRunnerDeco() qr: QueryRunner,   // @QueryRunnerDeco: request.queryRunner 추출 데코레이터
) {
  return this.authService.createUser(dto, qr);
}
```

### 서비스

```typescript
async createUser(dto: CreateUserDto, qr: QueryRunner) {
  const userRepo = qr.manager.getRepository(UserModel);
  const blogRepo = qr.manager.getRepository(BlogModel);

  const user = userRepo.create({
    email: dto.email,
    user_id: dto.userId,
    user_name: dto.name,
    provider: dto.provider,
    avatar_url: dto.avatar_url,
  });
  const savedUser = await userRepo.save(user);

  // 동일 트랜잭션 내에서 블로그 생성
  await this.blogService.createBlog({ user: savedUser }, qr);

  return savedUser;
}
```

---

## 9. 데이터베이스 스키마

### 관계 요약

```
users ──(1:1)── blogs          (cascade delete)
users ──(1:N)── posts
users ──(1:N)── comments
users ──(1:N)── post_likes     (cascade delete)
posts ──(1:N)── comments
posts ──(1:N)── post_likes     (cascade delete)
posts ──(N:M)── tags           (post_tags 중간 테이블 자동 생성)
```

### ERD (텍스트)

```
┌──────────────────┐         ┌──────────────────┐
│      users       │──1:1───▶│      blogs       │
├──────────────────┤         ├──────────────────┤
│ id        UUID PK│         │ id        UUID PK│
│ email     unique │         │ user_id   FK     │
│ user_id   unique │         │ url_slug         │
│ user_name unique │         │ title    max:40  │
│ avatar_url       │         │ description max:100│
│ password  nullable│        └──────────────────┘
│ status    enum   │
│ provider  enum   │         ┌──────────────────┐
│ created_at       │         │   post_likes     │
│ updated_at       │         ├──────────────────┤
└────────┬─────────┘         │ id        UUID PK│
         │1:N                │ user_id   FK     │
         ▼                   │ post_id   FK     │
┌──────────────────┐         │ UNIQUE(user,post) │
│      posts       │──1:N───▶└──────────────────┘
├──────────────────┤
│ id        INT PK │         ┌──────────────────┐
│ user_id   FK     │──1:N───▶│    comments      │
│ path             │         ├──────────────────┤
│ title            │         │ id        UUID PK│
│ summary  max:100 │         │ post_id   FK     │
│ content  text    │         │ user_id   FK     │
│ thumbnail        │         │ content  max:100 │
│ status           │         │ level    int     │
│ visibility bool  │         │ pid      UUID    │
│ deleted_at soft  │         │ deleted_at soft  │
│ created_at       │         └──────────────────┘
│ updated_at       │
└────────┬─────────┘
         │N:M
         ▼
┌──────────────────┐         ┌──────────────────┐
│   post_tags      │         │      tags        │
├──────────────────┤         ├──────────────────┤
│ post_id   FK     │────────▶│ id        UUID PK│
│ tag_id    FK     │         │ name      unique │
└──────────────────┘         └──────────────────┘
```

---

## 10. API 엔드포인트 전체 목록

### Auth (`/auth`)

| Method | Path | Guard | 요청 Body / Params | 응답 |
|--------|------|-------|-------------------|------|
| POST | `/auth/signIn` | - | `{ email, provider, password? }` | `{ accessToken, refreshToken }` |
| POST | `/auth/access` | RefreshTokenGuard | - (헤더 토큰) | `{ accessToken }` |
| GET | `/auth/users` | - | - | `UserModel[]` |
| GET | `/auth/users/:userId` | - | `userId: UUID` | `UserModel` |
| GET | `/auth/users/:email/exists` | - | `email: string` | `{ exists: boolean }` |
| GET | `/auth/users/email/:email` | - | `email: string` | `UserModel` |
| POST | `/auth/users` | TransactionInterceptor | `CreateUserDto` | `UserModel` |

### Post (`/post`)

| Method | Path | Guard | 요청 | 응답 |
|--------|------|-------|------|------|
| POST | `/post` | AccessToken + Transaction | `CreatePostDto` | `PostModel` |
| GET | `/post` | - | `?cursor=number` | `{ data, hasNext, cursor, count }` |
| GET | `/post/:userId/:path` | - | URL 파라미터 | `PostModel` |
| POST | `/post/like/:postId` | AccessTokenGuard | `postId: number` | `PostLikeModel` |
| DELETE | `/post/like/:postId` | AccessTokenGuard | `postId: number` | `void` |

### Comment (`/comment`) — WIP

| Method | Path | 상태 |
|--------|------|------|
| - | - | 미구현 |

---

## 11. 환경 변수

파일: `.env.local`

| 변수 | 필수 여부 | 설명 |
|------|----------|------|
| `DB_NAME` | 필수 | PostgreSQL 데이터베이스 이름 |
| `DB_USERNAME` | 필수 | PostgreSQL 유저명 |
| `DB_PASSWORD` | 필수 | PostgreSQL 비밀번호 |

**현재 하드코딩된 값 (이전 필요)**

| 항목 | 현재 값 | 권장 이전 대상 |
|------|---------|--------------|
| JWT Secret | `'secret_key'` | `process.env.JWT_SECRET` |

---

## 12. 미완성 항목 & TODO

| 항목 | 우선순위 | 상태 | 설명 |
|------|---------|------|------|
| JWT Secret 환경변수화 | 높음 | 미완 | `auth.service.ts`의 `'secret_key'` → `process.env.JWT_SECRET` |
| 프로덕션 DB 마이그레이션 설정 | 높음 | 미완 | `synchronize: false` 전환 후 TypeORM CLI 마이그레이션 필요 |
| CommentModule Service/Controller 구현 | 중간 | WIP | Entity는 존재, 비즈니스 로직 및 엔드포인트 설계 필요 |
| 토큰 블랙리스트 (로그아웃) | 중간 | 미구현 | 로그아웃 시 Refresh Token 무효화 처리 없음 |
| 이미지 업로드 처리 | 중간 | 미구현 | 썸네일 URL만 저장, 실제 파일 업로드 API 없음 (S3 등 연동 필요) |
| TagModule 구현 | 낮음 | WIP | Tag CRUD 및 Post 연동 API 미구현 |
| BlogModule 컨트롤러 | 낮음 | 미구현 | 블로그 정보 조회/수정 API 없음 |
| 이메일 인증 | 낮음 | 미구현 | 이메일/비밀번호 가입 시 이메일 인증 플로우 없음 |
| 유저 삭제/탈퇴 처리 | 낮음 | 미구현 | `status: WITHDRAWN` 필드만 존재, 실제 처리 로직 없음 |
