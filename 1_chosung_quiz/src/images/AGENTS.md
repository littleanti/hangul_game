<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# src/images

## Purpose
사진 모드(imageMode=true)에서 이모지 대신 표시되는 로컬 이미지 파일. 현재 과일 카테고리 일부에만 존재하며, 이미지가 없거나 로드 실패 시 이모지로 자동 폴백된다.

## Key Files

| File | 대응 단어 |
|------|---------|
| `사과.jpg` | 사과 |
| `바나나.jpg` | 바나나 |
| `딸기.jpg` | 딸기 |
| `수박.jpg` | 수박 |
| `포도.jpg` | 포도 |
| `복숭아.jpg` | 복숭아 |
| `귤.jpg` | 귤 |
| `키위.jpg` | 키위 |

## For AI Agents

### Working In This Directory
- 이미지 추가 시 `src/data/words.js`의 해당 단어에 `imageUrl: './src/images/파일명.jpg'` 추가.
- 이미지가 없어도 게임 동작에는 지장 없음 — `img.onerror`가 이모지로 자동 폴백.
- 파일명은 한글 단어와 일치시킬 것 (예: `레몬.jpg` → `imageUrl: './src/images/레몬.jpg'`).

<!-- MANUAL: -->
