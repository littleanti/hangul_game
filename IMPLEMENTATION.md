# hangul_game 통합 저장소 & GitHub Pages 배포 실현 가이드

## 개요

7개의 한글 학습 게임(초성 퀴즈 ~ 사자성어 크로스워드)을 **하나의 부모 저장소(모노레포)** 로 묶고, GitHub Pages로 단일 사이트에 배포하기 위한 실행 가이드입니다.

- **무엇을 만드는가:** 현재 각자 독립된 `.git`을 가진 7개 게임 폴더를 부모 폴더 `hangul_game` 하나의 git 저장소로 통합하고, 루트에 게임 선택용 런처(landing) 페이지를 추가합니다.
- **최종 목표:** 이미 운영 중인 `persora`, `wordrobe`와 **정확히 동일한 패턴**(레포 = github.io 사이트)으로, `https://littleanti.github.io/hangul_game/` 에 배포해 7개 게임을 한 사이트에서 골라 즐길 수 있게 합니다.

핵심 전제(검증됨): 부모 폴더 `D:\yoon\codes\hangul_games`는 아직 git 레포가 아니며(`fatal: not a git repository` 확인), 7개 게임 하위 폴더는 각각 자체 `.git`을 보유 중입니다.

---

## 0. 현황 요약

게임별 PWA 여부, 빌드 스텝 유무, 서브패스(`/hangul_game/<game>/`) 배포를 위한 수정 필요 여부입니다.

| # | 게임 (폴더) | PWA 여부 | 빌드 스텝 | subpath 수정 필요 | 비고 |
|---|---|---|---|---|---|
| 1 | `1_chosung_quiz` | 아니오 | 없음 | **불필요** | 외부 절대 URL(Google Fonts)만 사용. 이미지 미가용 시 이모지 폴백 |
| 2 | `2_syllable_assembly` | 예 | 없음 | **불필요** | SW `./service-worker.js` 상대 등록, manifest `start_url=./index.html` |
| 3 | `3_word_network` | 아니오 | 없음 | **불필요** | Google Fonts만 외부 의존 |
| 4 | `4_morpheme_detective` | 예 | **있음** | **필요 (필수)** | `start_url='/'`, SW 캐시/`fetch` 핸들러가 루트 가정, SW 등록 코드 없음 |
| 5 | `5_vocabulary_tree` | 예 | 없음 | **불필요** | `register('./sw.js')`, manifest `start_url`/`scope` 모두 `./`. Dexie는 esm.sh CDN |
| 6 | `6_literacy_decoder` | 예 | 없음 | **필요 (테스트만)** | 프로덕션은 상대경로로 정상. `scripts/e2e-verify.mjs`에만 루트 절대경로 |
| 7 | `7_four-character_idiom_crossword` | 아니오 | 없음 | **불필요** | 외부 CDN 없음, 시스템 폰트, 인라인 SVG 아이콘 |

요약: **7개 중 5개(1·2·3·5·7)는 무수정**, 게임 4는 **배포 동작에 필수 수정**, 게임 6은 **테스트 스크립트 일관성 차원의 권장 수정**입니다. 빌드 스텝은 게임 4 하나뿐입니다.

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

#### 수정 불필요 (상대경로/외부 절대 URL만 사용) — 게임 1, 2, 3, 5, 7

- 1·3·7: PWA 아님, 절대경로 위험 없음 → **수정 없음**. (Google Fonts 등은 외부 절대 URL이라 서브패스 무관)
- 2 (syllable_assembly): SW가 `./service-worker.js`로 등록되고 캐시 URL이 전부 `./` 상대경로 → **자동으로 `/hangul_game/2_syllable_assembly/` 스코프**로 동작. manifest `start_url` = `./index.html` 상대 → OK. **수정 없음**.
- 5 (vocabulary_tree): `register('./sw.js')`, manifest `start_url`/`scope` 모두 `"./"` → **수정 없음**. (Dexie는 esm.sh 외부 CDN이라 무관)

#### 수정 필요 — 게임 4 (morpheme_detective): 루트 절대경로 + SW 미등록

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

#### 수정 필요 — 게임 6 (literacy_decoder): 테스트 스크립트만 (런타임 무해)

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

### 2.4 GitHub Actions 워크플로 (전체 YAML)

`actions/deploy-pages`(공식) 방식. 게임 4의 빌드 스텝(아이콘/SW 생성)을 실행하고, 서브모듈을 쓸 경우를 대비해 `submodules: recursive`를 포함했습니다(현재는 vendoring 권장이므로 서브모듈이 없어도 무해). `.nojekyll`을 생성해 Jekyll 처리를 끄고, 부모 디렉터리 전체를 아티팩트로 업로드합니다.

`.github/workflows/deploy.yml`:

```yaml
name: Deploy hangul_game to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

# Pages 배포에 필요한 최소 권한
permissions:
  contents: read
  pages: write
  id-token: write

# 동시 배포 방지(진행 중 배포는 취소하지 않고 큐잉)
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout (서브모듈 포함 — 없으면 무시됨)
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      # 게임 4(morpheme_detective)만 빌드 스텝 보유: 아이콘/SW 생성.
      # package-lock.json 유무에 따라 ci/install 자동 선택, 빌드 스크립트가 없으면 건너뜀.
      - name: Build game 4 (morpheme_detective)
        working-directory: 4_morpheme_detective
        run: |
          if [ -f package-lock.json ]; then npm ci; else npm install; fi
          # gen-icons / gen-sw 등은 build 스크립트에 묶여 있다고 가정. 없으면 skip.
          npm run build --if-present
          # build 스크립트에 포함돼 있지 않다면 명시 실행(존재할 때만):
          [ -f scripts/gen-icons.mjs ] && node scripts/gen-icons.mjs || true
          [ -f scripts/gen-sw.mjs ]   && node scripts/gen-sw.mjs   || true

      # 향후 다른 게임에 빌드가 추가되면 위와 같은 스텝을 복제.

      - name: Disable Jekyll (.nojekyll)
        run: touch .nojekyll

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact (사이트 루트 = 레포 루트)
        uses: actions/upload-pages-artifact@v3
        with:
          # 부모 레포 루트를 그대로 업로드 → /hangul_game/ 아래 게시.
          # node_modules 등 불필요 파일이 크면 별도 디렉터리로 rsync 후 그 경로 지정 권장.
          path: .

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

> 업로드 용량 주의: 게임 4의 `node_modules`(sharp, hanzi-writer-data 등 수천 개 한자 JSON)는 빌드 산출물이 아니라 **빌드 입력**입니다. `path: .`로 통째로 올리면 `node_modules`까지 게시되어 아티팩트가 비대해집니다. 빌드 스텝 뒤에 게시 대상만 별도 디렉터리(`_site`)로 복사하고 `node_modules`/`.git`/`scripts`를 제외한 뒤 `path: _site`를 지정하는 것을 권장합니다 (rsync `--exclude` 사용).

---

### 2.5 (선택) 커스텀 도메인

기본은 `https://littleanti.github.io/hangul_game/`로 충분합니다. 커스텀 도메인을 붙일 경우:

- **서브패스가 사라짐**: 커스텀 도메인(예: `games.example.com`)을 레포에 연결하면 사이트가 **도메인 루트**에서 서비스됩니다. 즉 게임은 `https://games.example.com/<game>/`가 되어 `/hangul_game/` 세그먼트가 없어집니다. 모든 자원이 이미 상대경로(`./`)이므로 코드 수정은 불필요하고, 런처 링크도 `./` 상대라 그대로 동작합니다 — 상대경로 통일의 이점.
- **설정**: 레포 루트에 `CNAME` 파일(도메인 한 줄) 추가 → Actions 아티팩트에도 포함되도록 둠. DNS는 apex면 `A`/`AAAA`(GitHub Pages IP) 또는 `ALIAS`, 서브도메인이면 `CNAME → littleanti.github.io`. Settings → Pages에서 도메인 입력 후 **Enforce HTTPS** 체크.
- **SW 스코프 영향 없음**: 상대경로 등록을 쓰므로 도메인이 바뀌어도 스코프는 디렉터리 기준으로 자동 재계산됩니다.

---

### 2.6 배포 요약 체크리스트

- [ ] 부모 폴더 git init → `hangul_game` 레포로 push (게임은 vendoring 권장, 서브모듈 시 워크플로 `submodules: recursive`가 처리)
- [ ] Settings → Pages → Source = **GitHub Actions**
- [ ] 루트에 런처 `index.html`(게임 링크는 모두 `./<폴더명>/` 상대경로)
- [ ] 게임 4: manifest `start_url`/`scope` → `./`, SW 등록 추가(상대경로 권장), `service-worker.js` + `gen-sw.mjs`의 `'/'` 판정 제거, `CACHE_VERSION` bump
- [ ] 게임 6: `scripts/e2e-verify.mjs`의 루트 절대경로 → 상대경로 (런타임 무해, 일관성)
- [ ] 게임 1·2·3·5·7: 수정 불필요
- [ ] `.nojekyll` 추가, `node_modules` 게시 제외
- [ ] 각 게임 SW 스코프는 디렉터리로 격리, 캐시/스토리지 키는 게임별 고유 접두사 유지

관련 파일 (절대경로):
- `D:\yoon\codes\hangul_games\4_morpheme_detective\manifest.webmanifest` (start_url 수정 대상)
- `D:\yoon\codes\hangul_games\4_morpheme_detective\service-worker.js` (6번째 줄 `'/'`, 223번째 줄 `url.pathname === '/'` 수정 대상)
- `D:\yoon\codes\hangul_games\4_morpheme_detective\scripts\gen-sw.mjs` (19번째 줄, 144번째 줄 동일 수정 — 미수정 시 재생성으로 덮어써짐)
- `D:\yoon\codes\hangul_games\6_literacy_decoder\scripts\e2e-verify.mjs` (루트 절대경로 → 상대경로)
- `D:\yoon\codes\hangul_games\.github\workflows\deploy.yml` (신규 생성 대상)

---

## 3. Overview 런처 페이지

부모 저장소 루트에 그대로 추가할 수 있는 완성형 `index.html`입니다. 인라인 CSS, 바닐라 JS, Google Fonts 링크가 모두 포함된 단일 파일이며, 공유 디자인 시스템(Jua/Gowun Dodum, coral/navy/cream/mint/yellow, 큰 둥근 버튼, 모바일 우선)을 따릅니다. 각 카드의 실행 버튼은 `/hangul_game/<game>/` 경로로 연결됩니다. 게임 폴더명(`1_chosung_quiz` ~ `7_four-character_idiom_crossword`)은 실제 디렉터리 구조와 일치하도록 확인했습니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="description" content="유아부터 중학생까지, 단계별 한글·어휘·문해력 학습 게임 모음. 초성퀴즈부터 사자성어 크로스워드까지 7단계 학습 로드맵." />
  <meta name="theme-color" content="#FF7757" />
  <title>한글 게임 | 단계별 한글·어휘·문해력 학습</title>

  <!-- Open Graph -->
  <meta property="og:title" content="한글 게임 — 단계별 학습 로드맵" />
  <meta property="og:description" content="유아부터 중학생까지, 7단계로 즐기는 한글·어휘·문해력 게임 모음." />
  <meta property="og:type" content="website" />

  <!-- Google Fonts: Jua(제목) + Gowun Dodum(본문) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&display=swap" rel="stylesheet" />

  <!-- 인라인 SVG 파비콘 (별도 파일 불필요) -->
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%23FF7757'/%3E%3Ctext x='50' y='72' font-size='60' text-anchor='middle' fill='%23FFF6E4' font-family='sans-serif'%3E%ED%95%9C%3C/text%3E%3C/svg%3E" />

  <style>
    :root {
      --coral: #FF7757;
      --navy: #2D3047;
      --cream: #FFF6E4;
      --mint: #6BCAB8;
      --yellow: #FFD166;
      --card-bg: #FFFFFF;
      --shadow: 0 8px 24px rgba(45, 48, 71, 0.12);
      --shadow-hover: 0 14px 32px rgba(45, 48, 71, 0.20);
      --radius: 24px;
      --radius-btn: 999px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html { -webkit-text-size-adjust: 100%; }

    body {
      font-family: 'Gowun Dodum', system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
      background-color: var(--cream);
      background-image:
        radial-gradient(circle at 12% 18%, rgba(107, 202, 184, 0.18), transparent 42%),
        radial-gradient(circle at 88% 12%, rgba(255, 209, 102, 0.22), transparent 40%),
        radial-gradient(circle at 78% 92%, rgba(255, 119, 87, 0.14), transparent 45%);
      color: var(--navy);
      min-height: 100vh;
      line-height: 1.6;
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    }

    .wrap {
      width: 100%;
      max-width: 1080px;
      margin: 0 auto;
      padding: 32px 20px 64px;
    }

    /* ===== Header ===== */
    header { text-align: center; margin-bottom: 12px; }

    .badge {
      display: inline-block;
      font-family: 'Jua', sans-serif;
      background: var(--mint);
      color: #fff;
      padding: 6px 18px;
      border-radius: var(--radius-btn);
      font-size: 0.95rem;
      letter-spacing: 0.5px;
      box-shadow: var(--shadow);
      margin-bottom: 18px;
    }

    h1 {
      font-family: 'Jua', sans-serif;
      font-size: clamp(2.1rem, 7vw, 3.4rem);
      color: var(--navy);
      line-height: 1.2;
      margin-bottom: 14px;
    }

    h1 .accent { color: var(--coral); }

    .subtitle {
      font-size: clamp(1rem, 3.6vw, 1.2rem);
      color: #5b5f78;
      max-width: 560px;
      margin: 0 auto;
    }

    /* ===== Roadmap progress strip ===== */
    .roadmap {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      margin: 28px auto 40px;
      max-width: 640px;
    }

    .roadmap .dot {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-family: 'Jua', sans-serif;
      font-size: 0.95rem;
      color: #fff;
      background: var(--coral);
      box-shadow: var(--shadow);
      flex: 0 0 auto;
    }

    .roadmap .line {
      width: 18px;
      height: 4px;
      border-radius: 2px;
      background: rgba(45, 48, 71, 0.18);
      flex: 0 0 auto;
    }

    /* ===== Card grid ===== */
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 18px;
    }

    @media (min-width: 560px) {
      .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
    }
    @media (min-width: 880px) {
      .grid { grid-template-columns: repeat(3, 1fr); gap: 22px; }
    }

    .card {
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: 24px 22px 22px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      border: 3px solid transparent;
    }

    .card::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: var(--accent, var(--coral));
    }

    .card:hover, .card:focus-within {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
      border-color: var(--accent, var(--coral));
    }

    .card-top {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .stage-num {
      flex: 0 0 auto;
      width: 48px;
      height: 48px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      font-family: 'Jua', sans-serif;
      font-size: 1.5rem;
      color: #fff;
      background: var(--accent, var(--coral));
    }

    .age-tag {
      font-family: 'Jua', sans-serif;
      font-size: 0.82rem;
      color: var(--navy);
      background: var(--yellow);
      padding: 5px 12px;
      border-radius: var(--radius-btn);
      white-space: nowrap;
    }

    .card h2 {
      font-family: 'Jua', sans-serif;
      font-size: 1.35rem;
      color: var(--navy);
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .card p {
      font-size: 0.97rem;
      color: #5b5f78;
      margin-bottom: 20px;
      flex: 1 1 auto;
    }

    .play-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: 'Jua', sans-serif;
      font-size: 1.1rem;
      text-decoration: none;
      color: #fff;
      background: var(--accent, var(--coral));
      padding: 14px 20px;
      border-radius: var(--radius-btn);
      box-shadow: 0 4px 0 rgba(0, 0, 0, 0.12);
      transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease;
      width: 100%;
    }

    .play-btn:hover { filter: brightness(1.05); }

    .play-btn:active {
      transform: translateY(3px);
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
    }

    .play-btn .arrow { font-size: 1.15rem; line-height: 1; }

    /* ===== Footer ===== */
    footer {
      text-align: center;
      margin-top: 48px;
      color: #8a8da4;
      font-size: 0.88rem;
    }

    footer .heart { color: var(--coral); }

    /* Accessibility: keyboard focus ring */
    .play-btn:focus-visible {
      outline: 3px solid var(--navy);
      outline-offset: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
      .card, .play-btn { transition: none; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <span class="badge">한글 학습 게임 시리즈</span>
      <h1>한글 게임 <span class="accent">놀이터</span></h1>
      <p class="subtitle">유아부터 중학생까지, 7단계로 차근차근 키우는 한글·어휘·문해력. 원하는 단계의 게임을 골라 바로 시작하세요!</p>
      <nav class="roadmap" id="roadmap" aria-label="학습 로드맵 7단계"></nav>
    </header>

    <main class="grid" id="grid" aria-label="게임 목록"></main>

    <footer>
      <p>아이의 한글 성장 단계에 맞춰 만든 무료 학습 게임 <span class="heart">&hearts;</span></p>
    </footer>
  </div>

  <script>
    // 배포 서브패스(부모 GitHub Pages) 기준 경로
    var BASE = "/hangul_game/";

    var GAMES = [
      {
        stage: 1,
        slug: "1_chosung_quiz",
        title: "초성 퀴즈",
        desc: "초성 힌트를 보고 단어를 맞혀요. 한글과 친해지는 첫걸음!",
        age: "유아~초저",
        color: "#FF7757"
      },
      {
        stage: 2,
        slug: "2_syllable_assembly",
        title: "음절 조립",
        desc: "자음과 모음을 모아 글자를 만들어요. 받침까지 척척!",
        age: "만 4~6세",
        color: "#6BCAB8"
      },
      {
        stage: 3,
        slug: "3_word_network",
        title: "어휘망",
        desc: "관련된 낱말을 이어 어휘 그물을 넓혀가요.",
        age: "만 5~7세",
        color: "#FFD166"
      },
      {
        stage: 4,
        slug: "4_morpheme_detective",
        title: "형태소 탐정",
        desc: "낱말을 쪼개 숨은 뜻조각을 찾는 탐정 놀이!",
        age: "초 1~2",
        color: "#FF7757"
      },
      {
        stage: 5,
        slug: "5_vocabulary_tree",
        title: "어휘 세계수",
        desc: "낱말 나무를 키우며 풍부한 어휘를 쌓아요.",
        age: "초 3~4",
        color: "#6BCAB8"
      },
      {
        stage: 6,
        slug: "6_literacy_decoder",
        title: "문해력 해독기",
        desc: "긴 글 속 핵심을 읽어내는 문해력 훈련소.",
        age: "초 5~6",
        color: "#FFD166"
      },
      {
        stage: 7,
        slug: "7_four-character_idiom_crossword",
        title: "사자성어 크로스워드",
        desc: "사자성어로 채우는 십자말풀이. 어휘력의 끝판왕!",
        age: "초고~중1",
        color: "#FF7757"
      }
    ];

    // ===== 카드 그리드 렌더링 =====
    (function renderGrid() {
      var grid = document.getElementById("grid");
      var frag = document.createDocumentFragment();

      GAMES.forEach(function (g) {
        var href = BASE + g.slug + "/";

        var card = document.createElement("article");
        card.className = "card";
        card.style.setProperty("--accent", g.color);

        var top = document.createElement("div");
        top.className = "card-top";

        var num = document.createElement("span");
        num.className = "stage-num";
        num.textContent = g.stage;
        num.setAttribute("aria-hidden", "true");

        var age = document.createElement("span");
        age.className = "age-tag";
        age.textContent = g.age;

        top.appendChild(num);
        top.appendChild(age);

        var h2 = document.createElement("h2");
        h2.textContent = g.stage + "단계 · " + g.title;

        var p = document.createElement("p");
        p.textContent = g.desc;

        var btn = document.createElement("a");
        btn.className = "play-btn";
        btn.href = href;
        btn.setAttribute("aria-label", g.title + " 실행하기");
        btn.innerHTML = '<span>실행</span><span class="arrow" aria-hidden="true">&rarr;</span>';

        card.appendChild(top);
        card.appendChild(h2);
        card.appendChild(p);
        card.appendChild(btn);
        frag.appendChild(card);
      });

      grid.appendChild(frag);
    })();

    // ===== 로드맵 진행 표시 렌더링 =====
    (function renderRoadmap() {
      var nav = document.getElementById("roadmap");
      var frag = document.createDocumentFragment();

      GAMES.forEach(function (g, i) {
        if (i > 0) {
          var line = document.createElement("span");
          line.className = "line";
          frag.appendChild(line);
        }
        var dot = document.createElement("span");
        dot.className = "dot";
        dot.style.background = g.color;
        dot.textContent = g.stage;
        dot.title = g.title + " (" + g.age + ")";
        frag.appendChild(dot);
      });

      nav.appendChild(frag);
    })();
  </script>
</body>
</html>
```

구현 메모:
- 링크 경로는 과제 명세대로 `/hangul_game/<game>/` 절대 서브패스를 사용합니다. 실제 부모 저장소 이름이 `hangul_game`이 아니라 `hangul_games`(현재 작업 폴더명)로 배포될 경우, JS 상단의 `var BASE = "/hangul_game/";` 한 줄만 `/hangul_games/`로 바꾸면 됩니다.
- 게임 슬러그 7개(`1_chosung_quiz` ~ `7_four-character_idiom_crossword`)는 실제 디렉터리(`D:\yoon\codes\hangul_games\*\index.html`)와 1:1로 일치함을 확인했습니다.
- 그리드는 모바일 1열 → 560px 이상 2열 → 880px 이상 3열로 반응합니다. 카드/버튼/색상/폰트는 공유 디자인 시스템(coral/navy/cream/mint/yellow, Jua+Gowun Dodum, 큰 둥근 버튼)을 그대로 사용합니다.
- 외부 의존성은 Google Fonts 한 건뿐이며, 파비콘은 인라인 SVG data URI라 추가 파일이 필요 없습니다. 빌드 단계 없이 루트에 그대로 두면 동작합니다.

---

## 4. 단계별 실행 체크리스트

아래 순서대로 진행하면 빈 폴더 부모에서 시작해 `https://littleanti.github.io/hangul_game/` 배포까지 완료됩니다.

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
- **캐시 이름 충돌**: `caches`는 오리진 공유 저장소다. 게임 2·4·5·6의 `CACHE_VERSION`/캐시 이름이 서로 달라야 한다(게임별 고유 접두사, 예 `morpheme-detective-v8`). 같은 이름이면 한 게임의 `activate` 단계가 다른 게임 캐시를 지운다. 신규 게임 추가 시 이 규칙을 반드시 강제.
- **localStorage / IndexedDB 충돌**: 오리진 스토리지도 공유된다. 게임 5의 Dexie/IndexedDB DB명, 각 게임의 localStorage 키에 게임별 접두사를 둔다.
- **재배포 후 옛 자산이 계속 보이는 문제**: 변경된 게임의 `CACHE_VERSION`을 bump하지 않으면 기존 SW가 옛 자산을 계속 서빙한다. 게임 4는 `node scripts/gen-sw.mjs`가 버전을 자동 +1 하므로 CI 빌드 스텝에서 반드시 실행. 디버깅 시 DevTools → Application → Service Workers에서 "Update on reload" / "Unregister" 후 강력 새로고침.

### 5.2 서브패스(base path) gotcha

- **루트 절대경로 금지**: `/src/...`, `/sw.js`, `/manifest.json`, `href="/1_chosung_quiz/"` 같은 루트 절대경로는 `/hangul_game/` 세그먼트를 건너뛰어 `littleanti.github.io/...`로 잘못 연결된다. 자원 참조와 링크는 전부 `./` 상대경로로 통일.
- **manifest `start_url`/`scope`**: 루트(`/`)가 아니라 상대(`./`)여야 서브패스에서 PWA가 정상 실행된다. 게임 4가 유일한 위반 사례.
- **폴더명 = URL 세그먼트**: 게임 폴더명이 곧 배포 URL의 경로다. 폴더명을 바꾸면 SW 스코프/링크가 전부 어긋난다. 통합 시점에 최종 이름을 확정하고 이후 변경 금지.
- **런처 `BASE` 값 동기화**: 섹션 3 런처의 `var BASE`는 실제 레포 이름과 일치해야 한다. 레포가 `hangul_games`로 배포되면 `"/hangul_games/"`로 한 줄만 수정. (커스텀 도메인 사용 시 서브패스가 사라지므로 `BASE`를 `"./"` 등으로 조정 가능 — 모든 자원이 상대경로라 코드 영향 최소.)
- **Jekyll 가공 문제**: `_`로 시작하는 파일/폴더는 Jekyll이 무시할 수 있다. `.nojekyll`을 루트(그리고 Actions 아티팩트 루트)에 두어 처리를 끈다.

### 5.3 통합 후 업데이트 플로우 (모노레포 vendoring 기준)

vendoring 방식이므로 서브모듈 같은 핀 업데이트가 없다. 일상 작업이 단순하다는 게 핵심 이점이다.

- **일상 변경**: 게임 코드를 부모 레포 안에서 직접 수정 → 커밋 → `main` push → Actions가 자동 배포. 별도 동기화 명령 불필요.
- **원본 레포로 역반영 안 됨**: 모노레포 변경은 아카이브된 원본 레포로 자동 반영되지 않는다. 게임이 서로 독립적이고 외부에서 원본을 쓰지 않으므로 실무 영향 없음. 향후 개발은 **모노레포에서만** 진행하는 것을 원칙으로 한다.
- **(서브모듈을 쓰는 경우의 주의 — 비권장 경로)**: 만약 fallback으로 서브모듈을 채택했다면, 부모에서 게임 최신 커밋을 받으려면 `git submodule update --remote --merge` 후 부모에 핀 커밋 변경을 커밋해야 한다. 그리고 GitHub Pages는 서브모듈을 자동 체크아웃하지 않으므로 워크플로 checkout에 `submodules: recursive`가 반드시 있어야 빈 폴더 배포를 막는다. 협업자/CI가 `git clone` 후 `git submodule update --init --recursive`를 빠뜨리면 빈 폴더가 된다.
- **(서브트리를 쓰는 경우)**: `git subtree pull --prefix=<게임폴더> <원본URL> main`으로 원본 변경을 흡수. 명령이 길고 머지 충돌 관리가 번거로우므로, 히스토리 통합 보존이 필수가 아니면 vendoring을 유지한다.
- **신규 게임 추가 규칙**: ① 폴더명을 URL 세그먼트로 확정, ② 모든 자원 상대경로 확인, ③ PWA면 SW 상대 등록 + manifest `./` + 고유 `CACHE_VERSION`/스토리지 접두사, ④ 런처 `index.html`의 `GAMES` 배열에 항목 추가.
