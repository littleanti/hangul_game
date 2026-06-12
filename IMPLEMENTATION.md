# hangul_game 통합 저장소 & GitHub Pages 배포 가이드

> 최종 갱신: 2026-06-12 — 12종 게임 운영 체제 반영

## 개요

한글 학습 게임들을 **하나의 부모 저장소(모노레포)** 로 묶고, GitHub Pages로 단일 사이트에 배포·운영하기 위한 가이드입니다.

- **현재 상태: 통합·배포 완료, 12종 운영 중.** 최초 7종(초성 퀴즈 ~ 사자성어 크로스워드)으로 통합·배포했고, 이후 5종(`2_vowel_finder`, `5_compound_split`, `7_reverse_root`, `9_sentence_clue_garden`, `11_idiom_syllable_typer`)이 추가되어 학습 단계순으로 1~12번으로 재배열되었습니다.
- **구조:** 각 게임은 부모 레포 루트 바로 아래 일반 디렉터리(vendoring)이며, 루트 `index.html`이 게임 선택용 런처(landing)입니다. `persora`, `wordrobe`와 동일한 패턴(레포 = github.io 사이트)입니다.
- **배포 주소:** `https://littleanti.github.io/hangul_game/` — `main` push 시 GitHub Actions(`.github/workflows/deploy.yml`)가 자동 배포합니다.

섹션 1~2와 4의 셋업 절차·명령은 **최초 통합 시점(7종 체제)의 실행 기록**입니다. 당시 게임 번호(예: "게임 4 = morpheme_detective")는 현재 폴더명과 다르므로, 현재 상태는 아래 §0 표를 기준으로 읽으세요.

---

## 0. 현황 요약 (12종, 2026-06-12 기준)

게임별 PWA 여부와 빌드 스텝입니다. **12종 모두 서브패스(`/hangul_game/<game>/`) 배포 요건을 충족**합니다 — SW는 전부 상대경로(`./sw.js` 또는 `./service-worker.js`)로 등록되고, manifest `start_url`은 모두 `./`(또는 `./index.html`)입니다.

| # | 게임 (폴더) | 게임명 | PWA | 빌드 스텝 | 비고 |
|---|---|---|---|---|---|
| 1 | `1_chosung_quiz` | 초성 퀴즈 | 아니오 | 없음 | Google Fonts만 외부 의존, 이미지 미가용 시 이모지 폴백 |
| 2 | `2_vowel_finder` | 모음 찾기 | 예 | 없음 | SW 캐시 `2_vowel_finder-v*` |
| 3 | `3_syllable_assembly` | 음절 조립 | 예 | 없음 | SW 캐시 `syllable-assembly-v*`, 등록은 `src/js/main.js` |
| 4 | `4_word_network` | 어휘망 | 아니오 | 없음 | Google Fonts만 외부 의존 |
| 5 | `5_compound_split` | 합성어 쪼개기 | 예 | 없음 | SW 캐시 `5_compound_split-v*`, 등록은 `src/js/main.js` |
| 6 | `6_morpheme_detective` | 형태소 탐정 | 예 | **있음** (`npm run gen-all`) | SW 캐시 `morpheme-detective-v*`. CI에서 best-effort 빌드, 산출물도 커밋에 포함 |
| 7 | `7_reverse_root` | 한자 뿌리 역분해 | 예 | 없음 | SW 캐시 `7_reverse_root-v*` |
| 8 | `8_vocabulary_tree` | 어휘 세계수 | 예 | 없음 | SW 캐시 `vt-cache-v*`, 등록은 `src/js/main.js`. Dexie는 esm.sh CDN |
| 9 | `9_sentence_clue_garden` | 문장 단서 정원 | 예 | 없음 | SW 캐시 `9_sentence_clue_garden-v*` |
| 10 | `10_literacy_decoder` | 문해력 해독기 | 예 | 없음 | SW 캐시 `literacy-decoder-v*`, 등록은 `src/js/main.js` |
| 11 | `11_idiom_syllable_typer` | 사자성어 받아쓰기 | 예 | 없음 | SW 캐시 `11_idiom_syllable_typer-v*` |
| 12 | `12_four-character_idiom_crossword` | 사자성어 크로스워드 | 아니오 | 없음 | 외부 CDN 없음, 시스템 폰트, 인라인 SVG 아이콘 |

요약: **PWA 9종(2·3·5·6·7·8·9·10·11), 비PWA 3종(1·4·12)**. 빌드 스텝은 게임 6(`6_morpheme_detective`) 하나뿐이며, SW 캐시 이름은 게임별 고유 접두사로 충돌 없음(§5.1 규칙 충족).

---

## 1. 저장소 묶음 전략

### 핵심 결론 (PRIMARY 권장: 플레인 모노레포 복사 + GitHub Actions 배포)

7개 게임을 **단일 모노레포(plain monorepo)** 로 합치고, 각 게임의 기존 독립 레포는 GitHub에 **아카이브(보존)** 상태로 남겨두는 방식을 권장합니다. 부모 폴더 `hangul_game`을 새 git 레포로 초기화하고, 7개 게임 폴더의 **소스만(`.git` 제외)** 복사해 한 레포에 넣은 뒤, GitHub Pages로 `https://<user>.github.io/hangul_game/` 에 배포합니다. 이미 운영 중인 `persora`, `wordrobe`와 정확히 동일한 패턴(레포 = Pages 사이트)입니다.

**왜 이 방식인가 (solo owner + 통합 관리 + Pages 빌드성 관점):**

| 평가 항목 | 모노레포 복사 (권장) | 서브모듈 | 서브트리 |
|---|---|---|---|
| (a) 단일 배포 사이트(통합 관리) | 한 레포 = 한 사이트, 가장 단순 | 가능하나 Pages가 서브모듈 미체크아웃 | 가능, 한 레포로 합쳐짐 |
| (b) 각 게임 독립 히스토리 보존 | 부모에선 단절, **원본 레포로 보존** | 포인터로 연결 유지(가장 강함) | 합치되 `--squash` 안 쓰면 히스토리 흡수 |
| (c) GitHub Pages 빌드성 | **그냥 동작**, 워크플로 불필요 | **Pages가 서브모듈을 안 받음** → Actions에서 `submodules: recursive` 필수 | **그냥 동작**(서브모듈 아님) |
| (d) solo 유지보수 부담 | **가장 낮음** | 가장 높음(detached HEAD, 핀 업데이트, 협업자 init 함정) | 중간(subtree pull/push 명령 난해) |

서브모듈의 결정적 약점은 (c)입니다. GitHub Pages 빌드(특히 `main` 브랜치 루트/`docs` 자동 배포)는 **서브모듈을 가져오지 않습니다**. 반드시 커스텀 GitHub Actions 워크플로에서 `actions/checkout`에 `submodules: recursive`를 넣어 체크아웃해야 콘텐츠가 채워지며, 토큰/권한·detached HEAD·핀 커밋 업데이트 같은 운영 부담이 1인 개발자에게 누적됩니다. 서브트리는 Pages 빌드성은 좋지만 `git subtree pull/push` 명령이 직관적이지 않고, 7개를 동시에 끌고 가면 머지 충돌·히스토리 비대화 관리가 번거롭습니다.

게임 7종 모두 **빌드 스텝이 사실상 불필요**하거나(7개 중 6개 빌드 없음), 정적 산출물이므로 모노레포 복사 후 그대로 서빙하면 됩니다. 게임 간 코드 공유가 없고 각자 독립 정적 사이트이므로, 서브모듈/서브트리가 주는 "양방향 동기화" 이점도 실질적으로 활용되지 않습니다. 즉, **가장 단순한 복사 방식이 모든 목표를 최저 비용으로 만족**합니다.

### 정확한 셋업 명령

전제: 부모 폴더 `D:\yoon\codes\hangul_games`는 아직 git 레포가 아니며, 7개 게임 폴더는 각자 `.git`을 가짐(위에서 확인됨). GitHub Pages 서브경로를 기존 `persora/wordrobe`와 일관되게 맞추려면 레포 이름을 `hangul_game`으로 둡니다(이때 사이트 베이스 경로는 `/hangul_game/...`).

> 주의: 분석 데이터의 4번 게임 수정 노트는 베이스 경로 `/hangul_game/4_morpheme_detective/`를 가정합니다. 최종 레포 이름과 폴더명이 그 경로와 정확히 일치해야 SW/매니페스트가 동작합니다.

**1) 부모 레포 초기화 (각 게임의 `.git`은 복사하지 않음)**

PowerShell 기준:
```powershell
cd D:\yoon\codes\hangul_games

# 각 게임 폴더 안의 .git 메타데이터 제거 (원본 레포는 GitHub에 그대로 남아있으므로 안전).
# 먼저 원본이 GitHub에 push 되어 있는지 반드시 확인할 것!
Get-ChildItem -Directory | ForEach-Object {
  $g = Join-Path $_.FullName '.git'
  if (Test-Path $g) { Remove-Item $g -Recurse -Force }
}

git init
git branch -M main
```

**2) 게이트키핑용 .gitignore 및 .nojekyll 추가**

GitHub Pages가 `_`로 시작하는 폴더/파일을 Jekyll로 가공해 깨뜨리는 것을 막기 위해 루트에 `.nojekyll` 빈 파일을 둡니다(폴더명이 숫자로 시작하지만 안전장치로 권장). 또한 dev 산출물 제외:
```powershell
"node_modules/`ndist/`n.DS_Store`n" | Out-File -Encoding utf8 .gitignore
New-Item -ItemType File .nojekyll | Out-Null
```

**3) 첫 커밋 및 원격 연결**
```powershell
git add -A
git commit -m "chore: 7개 한글 학습 게임을 단일 모노레포로 통합"

# GitHub에 hangul_game 레포를 미리 만든 뒤(빈 레포):
git remote add origin https://github.com/littleanti/hangul_game.git
git push -u origin main
```
(gh CLI가 있으면 레포 생성까지 한 번에:)
```powershell
gh repo create littleanti/hangul_game --public --source=. --remote=origin --push
```

**4) GitHub Pages 활성화 (두 가지 선택지)**

- **간단형(권장, 워크플로 불필요):** GitHub 레포 → Settings → Pages → "Deploy from a branch" → `main` / `/ (root)` 선택. 정적 파일이므로 빌드 없이 즉시 `https://littleanti.github.io/hangul_game/`로 서빙됩니다. 4번 게임만 빌드 스텝이 있으므로, 그 산출물을 **커밋에 포함**(빌드 후 정적 결과를 레포에 넣음)하면 워크플로 없이도 동작합니다.
- **Actions형(4번 빌드를 CI에서 돌리고 싶을 때):** `.github/workflows/pages.yml`에 `actions/checkout` → 4번 폴더 빌드 → `actions/upload-pages-artifact`(루트 업로드) → `actions/deploy-pages` 구성. 이 경우 Settings → Pages → Source는 "GitHub Actions"로 설정. **서브모듈이 아니므로 `submodules: recursive`는 불필요**합니다(이게 모노레포의 이점).

### 트레이드오프와 보완책

- **히스토리 단절(트레이드오프):** 부모 레포에는 각 게임의 과거 커밋 히스토리가 들어오지 않습니다. → **보완:** 원본 7개 레포를 삭제하지 말고 GitHub에서 **Archive(읽기 전용 보존)** 처리하면 (b) 목표(히스토리 보존)를 충족합니다. 향후 개발은 모노레포에서만 진행.
- **양방향 동기화 불가:** 모노레포에서 고친 내용이 원본 레포로 자동 반영되지 않음. 단, 게임들이 서로 독립적이고 외부에서 원본 레포를 따로 쓰지 않으므로 실무 영향 없음.
- **4번 게임(morpheme_detective) 필수 수정:** 통합 전·후 반드시 처리해야 동작합니다.
  - `manifest.webmanifest`의 `start_url`을 `/` → `/hangul_game/4_morpheme_detective/`
  - `index.html`에 SW 등록 추가: `navigator.serviceWorker.register('/hangul_game/4_morpheme_detective/service-worker.js', { scope: '/hangul_game/4_morpheme_detective/' })`
  - `service-worker.js`의 `APP_SHELL_URLS`(line 6 `'/'`)와 fetch 핸들러 pathname 체크(line 223 `=== '/'`)를 서브경로 기준으로 수정하거나 `scripts/gen-sw.mjs`를 base-path 설정으로 재생성.
- **6번 게임:** `scripts/e2e-verify.mjs`의 루트 절대경로(`'/src/...'`, `'/manifest.json'`, `'/sw.js'`)를 상대경로(`'./...'`)로 변경(테스트 전용이라 배포엔 영향 없지만 일관성 위해 권장).
- **공통:** Google Fonts CDN은 절대 URL이라 서브경로 영향 없음. 1번 게임의 외부 이미지 URL은 미가용 시 이모지 폴백이라 안전.

### Fallback 전략

**히스토리 통합 보존이 정말 중요해질 경우 → git subtree(서브모듈 아님)** 로 전환합니다. Pages 빌드성을 해치지 않으면서 각 게임 커밋 히스토리를 부모 레포에 흡수할 수 있습니다:
```powershell
git init; git branch -M main
git commit --allow-empty -m "init monorepo"
git subtree add --prefix=1_chosung_quiz https://github.com/littleanti/chosung-quiz.git main
git subtree add --prefix=2_syllable_assembly https://github.com/littleanti/syllable_assembly.git main
# ... 7개 반복 (히스토리 통째 흡수). 용량 절약은 --squash 추가.
```
**서브모듈은 비권장**(GitHub Pages가 자동으로 가져오지 않아 Actions에서 `submodules: recursive` 강제 필요 + solo 운영 부담)이며, 굳이 쓴다면 반드시 커스텀 Actions 워크플로의 checkout 단계에 `with: { submodules: recursive }`를 명시해야 사이트가 빈 폴더로 배포되지 않습니다.

---

## 2. GitHub Pages 배포 설계

### 2.1 배포 토폴로지 결정: 단일 부모 레포 + GitHub Actions

기존 `persora`, `wordrobe`와 동일한 방식(`<user>.github.io` 사용자 페이지)을 그대로 따라가되, hangul_games는 **7개 게임을 하나의 부모 사이트로 묶는** 구조이므로 다음과 같이 설계합니다.

**핵심 결정 사항**

| 항목 | 선택 | 이유 |
|---|---|---|
| 사이트 형태 | 프로젝트 페이지 `https://littleanti.github.io/hangul_game/` | 사용자 페이지(`littleanti.github.io` 루트)는 이미 다른 런처가 점유. hangul_game은 **서브패스 프로젝트 페이지**로 둔다 |
| 레포 구조 | **단일 부모 레포 `hangul_game`** (서브모듈 아님) | 7개 게임을 부모 레포 안에 일반 디렉터리로 흡수(vendoring). 서브모듈은 PWA 빌드/경로 수정·CI 토큰 관리가 번거롭고 게임이 정적이라 독립 버전 관리 이득이 적음 |
| 빌드 → 배포 | **GitHub Actions + `actions/deploy-pages`** | 게임 4번이 빌드 스텝(아이콘/SW 생성)을 가지므로 "deploy from branch"의 정적 복사로는 부족. Actions에서 빌드 후 아티팩트 업로드가 정석 |
| 배포 트리거 | `main` push + `workflow_dispatch` | |

> 중요: 디렉터리 이름이 현재 `1_chosung_quiz` … `7_four-character_idiom_crossword`이고, 과제 설명의 URL은 `/hangul_game/<game>/`입니다. 디렉터리 이름이 곧 URL 세그먼트가 되므로, **부모 레포 이름(`hangul_game`)과 각 게임 폴더명을 최종 URL로 확정**한 뒤 그에 맞춰 base path를 고정해야 합니다. 아래 모든 절대경로 수정은 `/hangul_game/<폴더명>/` 기준입니다.

#### 레포/Pages 설정 절차

1. 부모 폴더를 git 레포로 초기화하고 7개 게임을 일반 디렉터리로 포함, 원격 `hangul_game` 레포에 push.
2. GitHub 레포 → **Settings → Pages → Build and deployment → Source = "GitHub Actions"** 선택 (Deploy from a branch 아님).
3. 첫 push 시 아래 워크플로가 `github-pages` 환경에 배포 → `https://littleanti.github.io/hangul_game/` 게시.

#### "Deploy from branch" 대비 "GitHub Actions" 비교

- **Deploy from branch**: `main`/`gh-pages`의 정적 파일을 Jekyll로 그대로 게시. 빌드가 없으면 가장 단순하지만, 게임 4의 `npm run` 빌드(아이콘·SW 생성)를 수행할 수 없고, `_`로 시작하는 폴더(`1_chosung_quiz` 등은 해당 없음이나 `_`포함 자원 시)는 Jekyll이 무시할 수 있어 `.nojekyll` 필요.
- **GitHub Actions (채택)**: 빌드 스텝 실행 + 산출물만 정밀 업로드. `.nojekyll`을 아티팩트 루트에 넣어 Jekyll 처리 자체를 끔.

---

### 2.2 서브패스(base path) 문제와 게임별 수정

사이트가 루트가 아니라 `/hangul_game/`에서 서비스되고 각 게임은 `/hangul_game/<game>/`에 위치합니다. 따라서 **모든 자원 참조는 상대경로여야 하고, 루트 절대경로(`/`로 시작)는 금지**입니다. 위 진단 데이터 기준으로 게임별 조치는 다음과 같습니다.

#### 수정 불필요 (상대경로/외부 절대 URL만 사용) — 게임 1, 2, 3, 5, 7 (통합 시점 번호)

- 1·3·7: PWA 아님, 절대경로 위험 없음 → **수정 없음**. (Google Fonts 등은 외부 절대 URL이라 서브패스 무관)
- 2 (syllable_assembly): SW가 `./service-worker.js`로 등록되고 캐시 URL이 전부 `./` 상대경로 → **자동으로 `/hangul_game/2_syllable_assembly/` 스코프**로 동작. manifest `start_url` = `./index.html` 상대 → OK. **수정 없음**.
- 5 (vocabulary_tree): `register('./sw.js')`, manifest `start_url`/`scope` 모두 `"./"` → **수정 없음**. (Dexie는 esm.sh 외부 CDN이라 무관)

#### 수정 필요 — 게임 4 (morpheme_detective): 루트 절대경로 + SW 미등록 ✅ 적용 완료 (현재 폴더: `6_morpheme_detective`)

이 게임은 `start_url`/SW 캐시 키/`fetch` 핸들러가 루트(`'/'`)를 가정하고 있고, SW 등록 코드 자체가 없습니다. 진단 데이터와 실제 소스(`service-worker.js`, `manifest.webmanifest`, `scripts/gen-sw.mjs`)를 확인해 **상대경로 기반으로 통일**하는 것이 base path 변경에 강건합니다 (게임 2·5와 동일한 패턴으로 맞추는 전략).

수정 1 — `manifest.webmanifest` (5번째 줄):
```diff
- "start_url": "/",
+ "start_url": "./",
+ "scope": "./",
```

수정 2 — `index.html`에 SW 등록 추가(상대경로 등록 → 스코프 자동 결정, base path 변경에 무관):
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js');
    });
  }
</script>
```
주의: 진단 데이터는 절대경로 `'/hangul_game/4_morpheme_detective/service-worker.js'`로 등록하라고 제안하지만, **상대경로 `'./service-worker.js'`가 더 안전**합니다 — 폴더명/레포명이 바뀌어도 스코프가 문서 위치를 따라 자동 결정되고, 다른 게임(2·5)과 패턴이 일치합니다.

수정 3 — `service-worker.js`의 `APP_SHELL_URLS`에서 루트 절대 항목 제거. 현재 6번째 줄 `'/'`를 상대경로 `'./'`로 교체 (실제 진입점은 어차피 `'index.html'`로도 캐시됨):
```diff
- '/',
+ './',
```

수정 4 — `service-worker.js` `fetch` 핸들러의 루트 판정(223번째 줄)을 서브패스에서도 동작하도록 수정. 현재는 `url.pathname === '/'`만 앱셸로 인정하는데, 서브패스에서는 진입 경로가 `/hangul_game/4_morpheme_detective/`이므로 매칭 실패:
```diff
  const isAppShell = isLocal && (
-   url.pathname === '/' ||
+   url.pathname === self.registration.scope ||
+   url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html') ||
    url.pathname.includes('/src/css/') ||
    url.pathname.includes('/src/js/') ||
    url.pathname.includes('/src/data/') ||
    url.pathname.includes('/src/assets/') ||
    url.pathname.endsWith('manifest.webmanifest')
  );
```
`url.pathname.endsWith('/')`로 디렉터리 진입을 앱셸로 인정하면 base path와 독립적으로 안전합니다.

수정 5 — `scripts/gen-sw.mjs`는 SW를 재생성하므로 **소스 템플릿도 동일하게 고쳐야** 합니다. 그렇지 않으면 다음 `node scripts/gen-sw.mjs` 실행 때 수정 3·4가 덮어쓰기됩니다:
- 18~19번째 줄 `STATIC_ASSETS`의 `'/'` → `'./'`
- 143~144번째 줄 템플릿 `fetch` 핸들러의 `url.pathname === '/'` → 위 수정 4와 동일하게 변경

> 참고: 게임 4의 SW를 **굳이 등록하지 않는 선택지**도 유효합니다 (현재 어디에서도 register를 호출하지 않으므로, 그대로 두면 오프라인 캐시 없이 일반 정적 사이트로 동작하고 base path 문제도 사라짐). 오프라인/PWA 기능이 요구사항이 아니라면 수정 2를 생략하는 것이 가장 안전합니다.

#### 수정 필요 — 게임 6 (literacy_decoder): 테스트 스크립트만 (런타임 무해) ✅ 적용 완료 (현재 폴더: `10_literacy_decoder`)

프로덕션 게임 코드는 상대경로(`./sw.js`, manifest `./`)로 정상입니다. 루트 절대경로는 **`scripts/e2e-verify.mjs` 검증 스크립트에만** 존재하므로 배포 동작에는 영향이 없습니다. 다만 일관성/로컬 서브패스 테스트를 위해 수정 권장:
- 134, 149, 194번째 줄: `import('/src/js/state.js')` → `import('./src/js/state.js')`
- 265번째 줄: `fetch('/manifest.json')` → `fetch('./manifest.json')`
- 269번째 줄: `fetch('/sw.js')` → `fetch('./sw.js')`

#### 런처(랜딩) 페이지

부모 레포 루트에 `index.html`(런처)을 두고 각 게임으로 **상대경로 링크**합니다. 이 페이지가 `/hangul_game/`에서 서비스됩니다:
```html
<a href="./1_chosung_quiz/">초성 퀴즈</a>
<a href="./2_syllable_assembly/">음절 조립</a>
<!-- … 게임 3~7 동일하게 ./<폴더명>/ -->
```
루트 절대경로(`/1_chosung_quiz/`)를 쓰면 `littleanti.github.io/1_chosung_quiz/`로 잘못 연결되므로 **반드시 `./` 상대경로**를 사용합니다.

---

### 2.3 PWA / 서비스 워커 — 공유 오리진(origin) 주의사항

7개 게임 + 런처가 모두 **같은 오리진 `https://littleanti.github.io`** 아래 서브패스로 모입니다. 같은 오리진을 공유하므로 다음을 반드시 지켜야 합니다.

- **SW 스코프 격리**: 각 게임 SW는 자기 디렉터리(`/hangul_game/<game>/`)로만 스코프가 제한되어야 합니다. 상대경로 등록(`register('./...')`)을 쓰면 스코프가 자동으로 디렉터리에 한정되어 게임 간 fetch 가로채기 충돌이 없습니다. **루트 절대경로 등록(`/...`)이나 `scope: '/'`는 절대 금지** — 한 게임의 SW가 사이트 전체를 가로채게 됩니다.
- **캐시 이름 충돌 방지**: `caches`는 오리진 단위로 공유됩니다. 게임 2·4·5·6의 `CACHE_VERSION`/캐시 이름이 서로 달라야 합니다(예: `morpheme-detective-v8`처럼 게임별 접두사 유지). 같은 이름을 쓰면 한 게임의 `activate` 시 다른 게임 캐시를 삭제합니다. 현재 게임별로 고유 접두사를 쓰고 있어 OK이나, 신규 추가 시 규칙으로 강제하세요.
- **localStorage/IndexedDB 공유**: 오리진 스토리지(localStorage, 게임 5의 Dexie/IndexedDB DB명)도 공유됩니다. 게임별로 키/DB명에 고유 접두사를 두어 충돌을 막으세요.
- **SW 업데이트/캐시 무효화**: 재배포 시 변경 게임의 `CACHE_VERSION`을 bump 해야 사용자에게 신버전이 갑니다. 게임 4는 `node scripts/gen-sw.mjs`가 버전을 자동 +1 하므로 빌드 스텝에서 실행. 안 그러면 이전 SW가 옛 자산을 계속 서빙합니다.
- **HTTPS 요구**: GitHub Pages는 HTTPS 기본 제공 → SW 등록 요건 충족.

---

### 2.4 GitHub Actions 워크플로 (실제 적용본)

`actions/deploy-pages`(공식) 방식. 게임 6(`6_morpheme_detective`)의 빌드 스텝을 best-effort로 실행하고, `node_modules` 등 개발 산출물을 제외한 `_site` 스테이징 디렉터리만 아티팩트로 업로드합니다. 아래는 현재 적용 중인 `.github/workflows/deploy.yml` 전문입니다:

```yaml
name: Deploy hangul_game to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

# Minimal permissions required for Pages deployment via GitHub Actions.
permissions:
  contents: read
  pages: write
  id-token: write

# Prevent concurrent deployments (do not cancel an in-progress run; queue instead).
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      # Game 4 (morpheme_detective) has a build step that generates icons / SW.
      # Wrapped so it never hard-fails the deploy: missing scripts are skipped
      # (--if-present) and the whole step is best-effort (|| true).
      - name: Build morpheme_detective (단계 6)
        run: |
          (
            cd 6_morpheme_detective \
              && npm ci \
              && npm run gen-all --if-present
          ) || true

      # Stage a clean publish dir, excluding dev/build artifacts so node_modules
      # is never published. Trailing slash on ./ copies repo contents into _site.
      - name: Stage _site (exclude node_modules and tooling dirs)
        run: |
          mkdir -p _site
          rsync -a \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='.github' \
            --exclude='.omc' \
            --exclude='.codex' \
            --exclude='.vscode' \
            ./ _site/

      # Disable Jekyll processing in the published artifact.
      - name: Disable Jekyll (.nojekyll)
        run: touch _site/.nojekyll

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**대안 (`peaceiris/actions-gh-pages`)**: 공식 액션 대신 `gh-pages` 브랜치로 푸시하고 싶을 때 사용. 이 경우 Pages Source를 "Deploy from a branch → gh-pages"로 두고, 위 build 잡 끝에 아래로 교체:
```yaml
      - name: Publish to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
          enable_jekyll: false   # .nojekyll 자동 생성
```
공식 `actions/deploy-pages`가 별도 브랜치 없이 깔끔하므로 **기본 채택은 공식 액션**, `peaceiris`는 브랜치 산출물이 필요할 때만.

> 업로드 용량 주의 (적용 완료): 게임 6의 `node_modules`(sharp, hanzi-writer-data 등 수천 개 한자 JSON)는 빌드 산출물이 아니라 **빌드 입력**입니다. `path: .`로 통째로 올리면 `node_modules`까지 게시되어 아티팩트가 비대해지므로, 위 워크플로처럼 게시 대상만 `_site`로 rsync(`--exclude` 사용)한 뒤 `path: _site`를 업로드합니다.

---

### 2.5 (선택) 커스텀 도메인

기본은 `https://littleanti.github.io/hangul_game/`로 충분합니다. 커스텀 도메인을 붙일 경우:

- **서브패스가 사라짐**: 커스텀 도메인(예: `games.example.com`)을 레포에 연결하면 사이트가 **도메인 루트**에서 서비스됩니다. 즉 게임은 `https://games.example.com/<game>/`가 되어 `/hangul_game/` 세그먼트가 없어집니다. 모든 자원이 이미 상대경로(`./`)이므로 코드 수정은 불필요하고, 런처 링크도 `./` 상대라 그대로 동작합니다 — 상대경로 통일의 이점.
- **설정**: 레포 루트에 `CNAME` 파일(도메인 한 줄) 추가 → Actions 아티팩트에도 포함되도록 둠. DNS는 apex면 `A`/`AAAA`(GitHub Pages IP) 또는 `ALIAS`, 서브도메인이면 `CNAME → littleanti.github.io`. Settings → Pages에서 도메인 입력 후 **Enforce HTTPS** 체크.
- **SW 스코프 영향 없음**: 상대경로 등록을 쓰므로 도메인이 바뀌어도 스코프는 디렉터리 기준으로 자동 재계산됩니다.

---

### 2.6 배포 요약 체크리스트 (전 항목 완료)

- [x] 부모 폴더 git init → `hangul_game` 레포로 push (게임은 vendoring)
- [x] Settings → Pages → Source = **GitHub Actions**
- [x] 루트에 런처 `index.html` — `GAMES` 배열 12종, 링크는 `BASE + slug` (§3 참조)
- [x] 형태소 탐정(현 `6_morpheme_detective`): manifest `start_url`/`scope` → `./`, SW 상대경로 등록, `service-worker.js` + `gen-sw.mjs`의 `'/'` 판정 제거, `CACHE_VERSION` bump
- [x] 문해력 해독기(현 `10_literacy_decoder`): `scripts/e2e-verify.mjs`의 루트 절대경로 → 상대경로
- [x] 신규 추가 5종(2·5·7·9·11): §5.3 신규 게임 추가 규칙 준수 (상대경로 SW 등록·고유 캐시 접두사·manifest `./`)
- [x] `.nojekyll` 추가, `_site` 스테이징으로 `node_modules` 게시 제외
- [x] 각 게임 SW 스코프는 디렉터리로 격리, 캐시/스토리지 키는 게임별 고유 접두사 유지 (§0 표의 캐시 접두사 참조)

관련 파일 (절대경로, 현재 폴더명 기준):
- `D:\yoon\codes\hangul_games\6_morpheme_detective\manifest.webmanifest` / `service-worker.js` / `scripts\gen-sw.mjs`
- `D:\yoon\codes\hangul_games\10_literacy_decoder\scripts\e2e-verify.mjs`
- `D:\yoon\codes\hangul_games\.github\workflows\deploy.yml`
- `D:\yoon\codes\hangul_games\index.html` (런처 — `GAMES` 배열)

---

## 3. Overview 런처 페이지 (루트 `index.html`)

부모 레포 루트의 `index.html`이 게임 선택 런처입니다. 인라인 CSS, 바닐라 JS, Google Fonts(Jua 제목 + Gowun Dodum 본문) 링크가 모두 포함된 단일 파일이며, 공유 디자인 시스템(coral/navy/cream/mint/yellow, 큰 둥근 버튼, 모바일 우선)을 따릅니다.

> 이 문서에 런처 HTML 사본을 두지 않습니다 — **실제 파일(`index.html`)이 단일 소스**입니다. (과거 이 섹션에 있던 7종 기준 전체 HTML 사본은 실제 파일과 어긋나 제거했습니다.)

### 구조 요점

- `var BASE = "/hangul_game/";` — 배포 서브패스. 레포 이름이 바뀌면 이 한 줄만 수정. (커스텀 도메인 적용 시 §2.5 참조)
- `var GAMES = [...]` — 게임 메타데이터 배열(현재 12종). 카드 그리드(모바일 1열 → 560px 2열 → 880px 3열)와 상단 로드맵 점 표시가 이 배열에서 자동 렌더링됩니다.
- 각 항목 스키마: `{ stage, slug, title, desc, age, color, ready? }`
  - `slug`: **실제 폴더명과 1:1 일치** 필수 (폴더명 = URL 세그먼트, 링크는 `BASE + slug + "/"`)
  - `ready: false`: 카드가 "준비 중"(클릭 불가, 회색 버튼)으로 렌더링됨. 게임 완성 시 플래그를 제거하면 실행 버튼 활성화.
  - `color`: coral(`#FF7757`) / mint(`#6BCAB8`) / yellow(`#FFD166`) 3색 순환

### 신규 게임 추가 시 `GAMES` 항목 예시

```js
{
  stage: 13,
  slug: "13_new_game",   // 실제 폴더명과 일치 (URL 세그먼트)
  title: "게임 이름",
  desc: "카드에 표시할 한 줄 설명",
  age: "대상 연령",
  color: "#FF7757",      // coral/mint/yellow 순환 유지
  ready: false           // 개발 중엔 "준비 중", 완성 시 이 줄 제거
}
```

§5.3의 신규 게임 추가 규칙(상대경로·고유 캐시 접두사 등)과 함께 적용하세요.

---

## 4. 단계별 실행 체크리스트 (완료된 이력 — 통합 시점 7종 기준 번호)

아래 순서대로 진행해 빈 폴더 부모에서 시작, `https://littleanti.github.io/hangul_game/` 배포까지 완료했습니다. 이후 추가된 게임 5종은 §5.3의 신규 게임 추가 규칙을 따랐습니다.

1. **(사전) 원본 백업 확인** — 7개 게임 각 폴더의 `.git`을 제거하기 전에, 각 게임의 원본 레포가 GitHub에 push되어 있는지 확인하고 필요 시 **Archive(읽기 전용 보존)** 처리한다. (히스토리 보존 안전장치)

2. **부모 레포 초기화** — `D:\yoon\codes\hangul_games`에서 각 게임 하위 폴더의 `.git`을 제거하고(섹션 1의 PowerShell 스니펫), `git init && git branch -M main`을 실행한다.

3. **게임 vendoring 확정** — 7개 게임 폴더(`1_chosung_quiz` ~ `7_four-character_idiom_crossword`)가 부모 루트 바로 아래 일반 디렉터리로 위치하는지 확인한다. 폴더명 = 최종 URL 세그먼트이므로 변경하지 않는다.

4. **서브패스 수정 — 게임 4 (필수)**
   - `4_morpheme_detective/manifest.webmanifest`: `start_url`을 `./`로, `scope: "./"` 추가 (섹션 2.2 수정 1).
   - `4_morpheme_detective/index.html`: 상대경로 SW 등록 스크립트 추가 (섹션 2.2 수정 2). 오프라인/PWA가 불필요하면 이 수정을 생략해도 무방.
   - `4_morpheme_detective/service-worker.js`: `APP_SHELL_URLS`의 `'/'` → `'./'`(수정 3), `fetch` 핸들러 루트 판정 수정(수정 4).
   - `4_morpheme_detective/scripts/gen-sw.mjs`: 동일 변경 적용(수정 5) — 미적용 시 재생성으로 덮어써짐.
   - `CACHE_VERSION` bump.

5. **서브패스 수정 — 게임 6 (권장, 런타임 무해)** — `6_literacy_decoder/scripts/e2e-verify.mjs`의 루트 절대경로 5곳(134/149/194/265/269줄)을 상대경로로 변경.

6. **게임 1·2·3·5·7** — 수정 불필요. 그대로 둔다.

7. **Overview 런처 추가** — 섹션 3의 `index.html`을 부모 레포 루트에 그대로 생성한다(게임 링크는 모두 `./<폴더명>/` 또는 `BASE + slug` 상대 기반).

8. **`.nojekyll` + `.gitignore` 추가** — 루트에 빈 `.nojekyll` 생성, `.gitignore`에 `node_modules/`, `dist/`, `.DS_Store` 추가.

9. **GitHub Actions 워크플로 추가** — 섹션 2.4의 `.github/workflows/deploy.yml`을 생성한다. 게임 4 빌드 + `.nojekyll` + 아티팩트 업로드 + deploy 구성. (`node_modules` 게시 제외 위해 `_site` rsync 권장)

10. **첫 커밋 & 원격 push** — `git add -A && git commit -m "..."` 후, `hangul_game` 원격 레포를 만들고 push (gh CLI 시 `gh repo create ... --push`).

11. **Pages 활성화** — GitHub 레포 → Settings → Pages → Source = **GitHub Actions** 선택.

12. **배포 검증** — Actions 워크플로 성공 확인 후 `https://littleanti.github.io/hangul_game/` 접속 → 런처에서 7개 게임이 모두 열리는지 확인. 게임 4의 PWA(SW 등록·오프라인 캐시)와 manifest 동작, 게임 2/5/6의 SW 스코프가 자기 디렉터리로 한정되는지 DevTools → Application 탭에서 확인.

---

## 5. 주의사항 & 트러블슈팅

### 5.1 게임 간 서비스 워커 / 캐시 공유 (같은 오리진 함정)

7개 게임 + 런처가 모두 같은 오리진 `https://littleanti.github.io` 아래 모이므로, 스토리지와 SW가 오리진 단위로 공유됩니다. 다음이 가장 흔한 사고 지점입니다.

- **SW 스코프 격리**: 반드시 상대경로 등록(`register('./...')`)만 사용. 루트 절대경로 등록이나 `scope: '/'`를 쓰면 한 게임의 SW가 `/hangul_game/` 전체(다른 게임 포함)를 가로채 잘못된 캐시를 서빙한다. 게임 4 수정 시 진단 데이터의 절대경로 등록 제안 대신 **상대경로 등록을 채택**한 이유.
- **캐시 이름 충돌**: `caches`는 오리진 공유 저장소다. PWA 게임 9종(2·3·5·6·7·8·9·10·11)의 `CACHE_VERSION`/캐시 이름이 서로 달라야 한다(게임별 고유 접두사 — 현재 값은 §0 표 참조). 같은 이름이면 한 게임의 `activate` 단계가 다른 게임 캐시를 지운다. 신규 게임 추가 시 이 규칙을 반드시 강제.
- **localStorage / IndexedDB 충돌**: 오리진 스토리지도 공유된다. 게임 8(어휘 세계수)의 Dexie/IndexedDB DB명, 각 게임의 localStorage 키에 게임별 접두사를 둔다.
- **재배포 후 옛 자산이 계속 보이는 문제**: 변경된 게임의 `CACHE_VERSION`을 bump하지 않으면 기존 SW가 옛 자산을 계속 서빙한다. 게임 6(`6_morpheme_detective`)은 `node scripts/gen-sw.mjs`가 버전을 자동 +1 하므로 CI 빌드 스텝에서 실행된다. 디버깅 시 DevTools → Application → Service Workers에서 "Update on reload" / "Unregister" 후 강력 새로고침.

### 5.2 서브패스(base path) gotcha

- **루트 절대경로 금지**: `/src/...`, `/sw.js`, `/manifest.json`, `href="/1_chosung_quiz/"` 같은 루트 절대경로는 `/hangul_game/` 세그먼트를 건너뛰어 `littleanti.github.io/...`로 잘못 연결된다. 자원 참조와 링크는 전부 `./` 상대경로로 통일.
- **manifest `start_url`/`scope`**: 루트(`/`)가 아니라 상대(`./`)여야 서브패스에서 PWA가 정상 실행된다. (유일한 위반 사례였던 형태소 탐정은 수정 완료 — 현재 12종 모두 충족)
- **폴더명 = URL 세그먼트**: 게임 폴더명이 곧 배포 URL의 경로다. 폴더명을 바꾸면 SW 스코프/링크가 전부 어긋난다. 통합 시점에 최종 이름을 확정하고 이후 변경 금지.
- **런처 `BASE` 값 동기화**: 섹션 3 런처의 `var BASE`는 실제 레포 이름과 일치해야 한다. 레포가 `hangul_games`로 배포되면 `"/hangul_games/"`로 한 줄만 수정. (커스텀 도메인 사용 시 서브패스가 사라지므로 `BASE`를 `"./"` 등으로 조정 가능 — 모든 자원이 상대경로라 코드 영향 최소.)
- **Jekyll 가공 문제**: `_`로 시작하는 파일/폴더는 Jekyll이 무시할 수 있다. `.nojekyll`을 루트(그리고 Actions 아티팩트 루트)에 두어 처리를 끈다.

### 5.3 통합 후 업데이트 플로우 (모노레포 vendoring 기준)

vendoring 방식이므로 서브모듈 같은 핀 업데이트가 없다. 일상 작업이 단순하다는 게 핵심 이점이다.

- **일상 변경**: 게임 코드를 부모 레포 안에서 직접 수정 → 커밋 → `main` push → Actions가 자동 배포. 별도 동기화 명령 불필요.
- **원본 레포로 역반영 안 됨**: 모노레포 변경은 아카이브된 원본 레포로 자동 반영되지 않는다. 게임이 서로 독립적이고 외부에서 원본을 쓰지 않으므로 실무 영향 없음. 향후 개발은 **모노레포에서만** 진행하는 것을 원칙으로 한다.
- **(서브모듈을 쓰는 경우의 주의 — 비권장 경로)**: 만약 fallback으로 서브모듈을 채택했다면, 부모에서 게임 최신 커밋을 받으려면 `git submodule update --remote --merge` 후 부모에 핀 커밋 변경을 커밋해야 한다. 그리고 GitHub Pages는 서브모듈을 자동 체크아웃하지 않으므로 워크플로 checkout에 `submodules: recursive`가 반드시 있어야 빈 폴더 배포를 막는다. 협업자/CI가 `git clone` 후 `git submodule update --init --recursive`를 빠뜨리면 빈 폴더가 된다.
- **(서브트리를 쓰는 경우)**: `git subtree pull --prefix=<게임폴더> <원본URL> main`으로 원본 변경을 흡수. 명령이 길고 머지 충돌 관리가 번거로우므로, 히스토리 통합 보존이 필수가 아니면 vendoring을 유지한다.
- **신규 게임 추가 규칙**: ① 폴더명을 URL 세그먼트로 확정(학습 단계 순 번호), ② 모든 자원 상대경로 확인, ③ PWA면 SW 상대 등록 + manifest `./` + 고유 `CACHE_VERSION`/스토리지 접두사, ④ 런처 `index.html`의 `GAMES` 배열에 항목 추가(§3 예시 참조 — 개발 중엔 `ready: false`로 "준비 중" 처리, 완성 시 제거), ⑤ §0 현황 표에 행 추가.
