<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# src/data

## Purpose
게임에서 사용하는 단어 데이터베이스. 단어 추가·수정·카테고리 관리는 이 디렉토리에서만 한다.

## Key Files

| File | Description |
|------|-------------|
| `words.js` | `CATEGORIES` 배열과 `WORDS` 배열을 export. 단어 DB 전체 |

## Data Format

```js
// CATEGORIES: 카테고리 이름 문자열 배열
export const CATEGORIES = ['과일', '동물', ...];

// WORDS: 단어 항목 배열
{ emoji: '🍎', word: '사과', category: '과일', imageUrl?: './src/images/사과.jpg' }
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `emoji` | ✅ | 이모지 표현 |
| `word` | ✅ | 한글 단어 (초성 추출 대상) |
| `category` | ✅ | `CATEGORIES`에 존재하는 값이어야 함 |
| `imageUrl` | ❌ | 사진 모드용 이미지 경로. 없으면 emoji 폴백 |

## Current Word Count (2026-04-25)

| 카테고리 | 단어 수 |
|---------|--------|
| 과일 | 17 |
| 동물 | 30 |
| 탈것 | 19 |
| 음식 | 20 |
| 자연 | 19 |
| 채소 | 11 |
| 스포츠 | 11 |
| 악기 | 9 |
| **합계** | **136** |

## Difficulty Distribution (word length)

- `easy` (1-2글자): 달, 별, 해, 배, 소, 닭, 양 등
- `medium` (3글자): 사과, 바나나, 강아지 등
- `hard` (4글자+): 아이스크림, 파인애플, 헬리콥터 등

## For AI Agents

### Working In This Directory
- **새 카테고리 추가 시** `CATEGORIES` 배열에도 반드시 추가.
- `category` 값은 `CATEGORIES`에 있는 문자열과 정확히 일치해야 함 (오타 주의).
- `imageUrl`이 있는 경우 `src/images/` 에 실제 파일이 있어야 함. 없으면 생략하거나 필드 제거.
- 단어 중복 추가 금지 — 동일 `word` 값이 이미 있는지 확인 후 추가.

### Testing Requirements
- 새 단어 추가 후 설정 화면에서 해당 카테고리를 선택하여 게임 플레이 확인.
- 새 카테고리 추가 후 설정 화면의 카테고리 칩이 정상 표시되는지 확인.

<!-- MANUAL: -->
