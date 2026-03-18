# API 설계 — dev.log

## 좋아요 (Like)

| 기능 | Method | Path | Auth |
|------|--------|------|------|
| 좋아요 추가 | `POST` | `/post/:postId/like` | 필요 |
| 좋아요 취소 | `DELETE` | `/post/:postId/like` | 필요 |
| 좋아요 상태 조회 | `GET` | `/post/:postId/like` | 필요 |

### GET `/post/:postId/like` 응답

```json
{
  "count": 42,
  "isLiked": true
}
```

### 설계 원칙

- `userId`는 경로에 노출하지 않음 → `Authorization` 헤더 토큰에서 추출 (`req.user`)
- `count` + `isLiked` 단일 응답으로 프론트 요청 최소화
- 비로그인 유저도 포스트를 볼 수 있는 구조로 변경 시:
  ```json
  { "count": 42, "isLiked": null }
  ```

### 경로 변경 이력

```
Before                             After
──────────────────────────────────────────────────────
POST   /post/like/:postId      →   POST   /post/:postId/like
DELETE /post/like/:postId      →   DELETE /post/:postId/like
GET    /post/like/:postId/:userId  →   GET    /post/:postId/like
```
