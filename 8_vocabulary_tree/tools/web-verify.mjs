#!/usr/bin/env node
// Web bot 자동 검증 — Playwright headless로 핵심 사용자 시나리오 검증
// 실행: node tools/web-verify.mjs
//
// PRD: .omc/prd.json US-001 ~ US-007

import { chromium, firefox, webkit } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BROWSER_KIND = process.env.BROWSER || 'chromium';
const BROWSERS = { chromium, firefox, webkit };

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const PORT = 4325;
const BASE = `http://localhost:${PORT}`;
const LOG_PATH = resolve(PROJECT_ROOT, 'tools/web-verify.log');

const results = [];
let passed = 0, failed = 0, stats = { consoleErrors: 0, networkFailures: 0 };

function check(id, name, ok, detail = '') {
  results.push({ id, name, ok, detail });
  if (ok) { passed++; console.log(`  ✓ ${id} ${name}`); }
  else    { failed++; console.log(`  ✘ ${id} ${name}${detail ? '  — ' + detail : ''}`); }
}

async function startServer() {
  console.log(`▶ Starting npx serve on :${PORT}...`);
  const proc = spawn('npx', ['-y', 'serve', '.', '-l', String(PORT)], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  // Wait for "Accepting connections" or up to 10s
  await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('serve timeout')), 12000);
    proc.stdout.on('data', d => { buf += d.toString(); if (buf.includes('Accepting connections') || buf.includes('Local')) { clearTimeout(t); resolve(); } });
    proc.stderr.on('data', d => { buf += d.toString(); });
    proc.on('error', reject);
  });
  // probe
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetch(BASE + '/');
      if (r.ok) break;
    } catch {}
    await sleep(300);
  }
  return proc;
}

function stopServer(proc) {
  try { proc.kill('SIGTERM'); } catch {}
}

async function main() {
  let serverProc = null;
  let browser = null;
  try {
    serverProc = await startServer();
    const bt = BROWSERS[BROWSER_KIND] || chromium;
    console.log(`▶ Launching ${BROWSER_KIND} headless...`);
    browser = await bt.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: { width: 412, height: 800 },
      deviceScaleFactor: 2,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/119.0 Mobile',
    });
    const page = await ctx.newPage();
    const errors = [];
    const allLogs = [];
    const failedRequests = [];
    page.on('console', msg => {
      const t = msg.type();
      const text = msg.text();
      allLogs.push(`[${t}] ${text}`);
      if (t === 'error') { errors.push(text); }
    });
    page.on('pageerror', err => errors.push('PAGEERROR: ' + (err.message || err)));
    page.on('requestfailed', req => {
      const u = req.url();
      // 외부 폰트는 무시
      if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return;
      failedRequests.push(`${req.failure()?.errorText || 'failed'} ${u}`);
    });
    page.on('response', resp => {
      const u = resp.url();
      if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return;
      if (resp.status() >= 400) failedRequests.push(`${resp.status()} ${u}`);
    });

    // ============ US-001 ============
    console.log('\n=== US-001 Splash load ===');
    const navRes = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    check('US-001', 'GET / 200', navRes && navRes.status() === 200, `status=${navRes?.status()}`);
    const title = await page.title();
    check('US-001', "title='어휘력 세계수'", title === '어휘력 세계수', `actual='${title}'`);
    await page.waitForSelector('#screen-splash.active h1', { timeout: 5000 }).catch(() => {});
    const h1 = await page.locator('#screen-splash h1').first().textContent().catch(() => '');
    check('US-001', "splash h1 == '어휘력 세계수'", (h1 || '').trim() === '어휘력 세계수', `actual='${h1}'`);

    // ============ US-006 (사이드: manifest/sw 응답) ============
    console.log('\n=== US-006 PWA 응답 ===');
    const manifestRes = await page.evaluate(async () => {
      const r = await fetch('./manifest.webmanifest');
      const j = r.ok ? await r.json() : null;
      return { ok: r.ok, status: r.status, name: j?.name, theme: j?.theme_color, start: j?.start_url };
    });
    check('US-006', 'manifest.webmanifest 200', manifestRes.ok && manifestRes.status === 200);
    check('US-006', 'manifest.name == 어휘력 세계수', manifestRes.name === '어휘력 세계수', `actual='${manifestRes.name}'`);
    check('US-006', 'manifest.theme_color == #FF7757', manifestRes.theme === '#FF7757');
    const swRes = await page.evaluate(async () => {
      const r = await fetch('./sw.js');
      return { ok: r.ok, status: r.status };
    });
    check('US-006', 'sw.js 200', swRes.ok && swRes.status === 200);
    // SW 등록 결과 확인
    const swReg = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { ok: false, reason: 'no-sw-api' };
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        return { ok: !!reg, scope: reg?.scope || null };
      } catch (e) { return { ok: false, reason: e.message }; }
    });
    check('US-006', 'Service Worker registered', swReg.ok, JSON.stringify(swReg));

    // ============ US-002 M1 풀 사이클 시뮬레이션 ============
    console.log('\n=== US-002 M1 풀 사이클 ===');
    // 진입 전: in-memory IndexedDB 초기화 (clean state)
    await page.evaluate(async () => {
      try {
        const dbs = await indexedDB.databases?.();
        for (const d of (dbs || [])) {
          if (d.name) await new Promise(r => { const req = indexedDB.deleteDatabase(d.name); req.onsuccess = r; req.onerror = r; req.onblocked = r; });
        }
      } catch {}
    });
    // 페이지 리로드 (깨끗한 상태)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#screen-splash.active', { timeout: 3000 });

    // '오늘 학습 시작' → today
    await page.click('#btn-today');
    await page.waitForSelector('#screen-today.active', { timeout: 3000 });
    const hanjaGlyph = await page.locator('.today-hanja-card .hanja-glyph').textContent();
    check('US-002', "today 화면 한자 글리프 표시", !!hanjaGlyph && hanjaGlyph.trim().length === 1, `glyph='${hanjaGlyph}'`);

    // 학습 시작 버튼 클릭
    await page.click('#today-start');
    await page.waitForSelector('#screen-play.active', { timeout: 3000 });
    const stageVisible = await page.locator('.tree-stage').isVisible();
    check('US-002', 'play .tree-stage 표시', stageVisible);

    // 음절 블록 + word-target 슬롯 카운트
    const slotCount = await page.locator('#word-target .target-slot').count();
    const blockCount = await page.locator('.syllable-block').count();
    check('US-002', 'word-target 슬롯 ≥ 2', slotCount >= 2, `slots=${slotCount}`);
    check('US-002', 'syllable-block ≥ 슬롯 수 + 더미', blockCount >= slotCount, `blocks=${blockCount}`);

    // 풀 사이클 시뮬레이션: 페이지 내부에서 음절을 직접 슬롯에 매칭하는 함수 호출
    // page evaluate로 main.js의 onBlockDrop 흐름을 모사: 정답 음절 블록을 슬롯 좌표로 보내는 dispatchPointer.
    // 더 안정적: pointerdown/move/up 시퀀스를 합성.
    async function dragSyllableToBranch(neededSyllable) {
      // 페이지 안에서 직접 PointerEvent 시퀀스를 dispatch — 더 deterministic.
      return await page.evaluate(async (syl) => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const block = [...document.querySelectorAll('.syllable-block')]
          .find(b => b.dataset.syllable === syl && !b.classList.contains('matched'));
        if (!block) return { ok: false, reason: 'block-not-found' };

        const stage = document.getElementById('tree-stage');
        const rect = stage.getBoundingClientRect();
        // 다음 후보 슬롯 (candidate 가지 중 최저 idx)
        const svg = document.getElementById('tree-svg');
        const candidatePaths = [...svg.querySelectorAll('path.branch-segment.candidate')];
        if (candidatePaths.length === 0) return { ok: false, reason: 'no-candidate-slot' };
        const slotIdx = candidatePaths
          .map(p => Number(p.getAttribute('data-slot')))
          .sort((a, b) => a - b)[0];

        const angles = [-55, -22, 22, 55];
        const lens = [320, 360, 360, 320];
        const VB = 1000;
        const rad = ((angles[slotIdx] - 90) * Math.PI) / 180;
        const xVB = VB / 2 + Math.cos(rad) * lens[slotIdx];
        const yVB = VB * 0.55 + Math.sin(rad) * lens[slotIdx];
        const dx = rect.left + (xVB / VB) * rect.width;
        const dy = rect.top + (yVB / VB) * rect.height;

        const bbox = block.getBoundingClientRect();
        const sx = bbox.left + bbox.width / 2;
        const sy = bbox.top + bbox.height / 2;

        const fire = (target, type, x, y, buttons) => {
          const ev = new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
            clientX: x,
            clientY: y,
            screenX: x,
            screenY: y,
            button: 0,
            buttons: buttons,
          });
          target.dispatchEvent(ev);
        };

        fire(block, 'pointerdown', sx, sy, 1);
        await sleep(20);
        const steps = 6;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const px = sx + (dx - sx) * t;
          const py = sy + (dy - sy) * t;
          fire(block, 'pointermove', px, py, 1);
          await sleep(15);
        }
        fire(block, 'pointerup', dx, dy, 0);
        await sleep(40);
        const consumed = block.classList.contains('matched') || !document.body.contains(block);
        return { ok: true, consumed };
      }, neededSyllable);
    }

    // 4어휘 풀 사이클
    let cycleOk = true;
    for (let wIdx = 0; wIdx < 4; wIdx++) {
      // 현재 어휘의 음절 시퀀스 추출
      const word = await page.evaluate(() => {
        const slots = [...document.querySelectorAll('#word-target .target-slot')];
        return slots.map(s => s.dataset.expect);
      });
      if (!word || word.length === 0) { cycleOk = false; break; }
      for (const syl of word) {
        const res = await dragSyllableToBranch(syl);
        if (!res.ok) { cycleOk = false; console.log('    drag fail:', syl, res); break; }
      }
      if (!cycleOk) break;
      // leaf-modal 등장 (autoSpeak 220ms + 모달 표시) → '다음 어휘' 클릭
      await page.waitForSelector('#modal-root.show .leaf-modal', { timeout: 4000 }).catch(() => {});
      const nextBtn = await page.$('#modal-root #leaf-next');
      if (nextBtn) await nextBtn.click();
      // 마지막 어휘면 modal 닫힘 후 finalizeDay → screen-lock 활성
      await sleep(700);
    }
    check('US-002', '4어휘 풀 사이클 완료', cycleOk);

    // 락 화면 활성
    await page.waitForSelector('#screen-lock.active', { timeout: 4000 }).catch(() => {});
    const lockActive = await page.locator('#screen-lock.active').count() > 0;
    check('US-002', 'screen-lock.active', lockActive);
    const lockEmoji = await page.locator('#screen-lock .lock-emoji').count();
    check('US-002', '.lock-emoji 표시', lockEmoji > 0);
    const lockStatsText = await page.locator('#screen-lock .lock-stats').textContent().catch(() => '');
    const matchN = lockStatsText.match(/누적 어휘[^0-9]*(\d+)/);
    const cumWords = matchN ? Number(matchN[1]) : 0;
    // 진단용 덤프
    const dbDiag = await page.evaluate(async () => {
      const dbMod = await import('./src/js/db.js');
      const words = await dbMod.listLearnedWords();
      const hanja = await dbMod.listLearnedHanja();
      return { usingMemory: dbMod.isMemoryMode(), wordCount: words.length, hanjaCount: hanja.length, sampleWord: words[0] || null };
    }).catch(e => ({ error: String(e) }));
    check('US-002', '누적 어휘 ≥ 4', cumWords >= 4, `cum=${cumWords}, db=${JSON.stringify(dbDiag)}, statsText='${lockStatsText.trim().slice(0,200)}'`);

    // ============ US-003 누적 나무 ============
    console.log('\n=== US-003 누적 나무 ===');
    // 홈으로 → 누적 나무 보기
    // lock 화면의 '나무 보기' 클릭
    const treeFromLock = await page.$('#screen-lock #lock-tree');
    if (treeFromLock) await treeFromLock.click();
    else {
      // 직접 splash로
      await page.evaluate(() => document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')));
      await page.evaluate(() => document.getElementById('screen-splash').classList.add('active'));
      await page.click('#btn-tree');
    }
    await page.waitForSelector('#screen-tree.active', { timeout: 6000 }).catch(() => {});
    const treeActive = await page.locator('#screen-tree.active').count() > 0;
    // 진단: tree active 안되면 다른 활성 screen 표시
    const activeScreens = await page.evaluate(() =>
      [...document.querySelectorAll('.screen.active')].map(s => s.id).join(',')
    );
    check('US-003', 'screen-tree.active', treeActive, `activeScreens='${activeScreens}'`);
    const metaChips = await page.locator('.overview-meta .meta-chip').count();
    check('US-003', '.overview-meta meta-chip ≥ 3', metaChips >= 3, `chips=${metaChips}`);
    const minimap = await page.locator('.minimap').count();
    const minimapVp = await page.locator('.minimap-viewport').count();
    check('US-003', '.minimap + viewport 존재', minimap > 0 && minimapVp > 0, `minimap=${minimap}, vp=${minimapVp}`);
    // 미니맵 안에도 id='ov-g'가 복제돼 있어 querySelectorAll에서 다중 매칭이 발생.
    // 메인 SVG 내부의 첫 매치만 검사한다.
    const camTransform = await page.evaluate(() => {
      const mainG = document.querySelector('#ov-svg #ov-g') || document.querySelector('#ov-g');
      return mainG?.getAttribute('transform') || '';
    });
    check('US-003', "ov-g transform 형식 matrix(...)", /^matrix\(/.test(camTransform), `transform='${camTransform}'`);

    // ============ US-005 학부모 PIN ============
    console.log('\n=== US-005 학부모 대시보드 PIN ===');
    // 홈으로
    await page.evaluate(() => document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')));
    await page.evaluate(() => document.getElementById('screen-splash').classList.add('active'));
    await page.click('#btn-dashboard');
    await page.waitForSelector('#screen-dashboard.active', { timeout: 4000 }).catch(() => {});
    const dashActive = await page.locator('#screen-dashboard.active').count() > 0;
    check('US-005', 'screen-dashboard.active', dashActive);
    const pinPad = await page.locator('.pin-pad').count();
    check('US-005', '.pin-pad 노출 (PIN 설정 화면)', pinPad > 0, `pad=${pinPad}`);

    // 4자리 PIN 입력 시뮬레이션 — 키패드의 1,2,3,4 클릭
    const enterPin = async () => {
      for (const digit of ['1','2','3','4']) {
        await page.click(`.pin-btn:has-text("${digit}")`);
        await sleep(80);
      }
    };
    await enterPin();
    // 다음 단계 (confirm) — 한 번 더 입력
    // 일부 구현체는 자동 진입; 없으면 확인 버튼 클릭
    await sleep(300);
    const stillPinSetup = await page.locator('.pin-pad').count() > 0;
    if (stillPinSetup) {
      // 다시 입력
      await enterPin();
      await sleep(300);
    }
    // pinHash 가 db.profile 에 저장됐는지 in-memory/IndexedDB 어디든 확인
    const pinHashSaved = await page.evaluate(async () => {
      // IndexedDB profile 테이블 직접 조회 시도
      const dbName = 'vocabulary_tree';
      return await new Promise((resolve) => {
        try {
          const req = indexedDB.open(dbName);
          req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('profile')) { resolve(null); return; }
            const tx = db.transaction('profile', 'readonly');
            const store = tx.objectStore('profile');
            const get = store.get('pinHash');
            get.onsuccess = () => resolve(get.result?.value || null);
            get.onerror = () => resolve(null);
          };
          req.onerror = () => resolve(null);
          req.onblocked = () => resolve(null);
        } catch { resolve(null); }
      });
    });
    check('US-005', 'pinHash 64자리 SHA-256 저장', typeof pinHashSaved === 'string' && /^[0-9a-f]{64}$/.test(pinHashSaved), `hash=${pinHashSaved?.slice(0, 16)}...`);

    // ============ US-004 학술 보스 ============
    console.log('\n=== US-004 학술 보스 ===');
    // db에 30 어휘 시드 (실제 IndexedDB 직접 주입)
    const seeded = await page.evaluate(async () => {
      const dbName = 'vocabulary_tree';
      return await new Promise((resolve) => {
        const req = indexedDB.open(dbName);
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('words')) { resolve(0); return; }
          const tx = db.transaction('words', 'readwrite');
          const store = tx.objectStore('words');
          let inserted = 0;
          for (let i = 1000; i < 1030; i++) {
            store.add({ wordId: i, hanjaId: 14, learnedAt: Date.now() });
            inserted++;
          }
          tx.oncomplete = () => resolve(inserted);
          tx.onerror = () => resolve(0);
        };
        req.onerror = () => resolve(0);
      });
    });
    check('US-004', '30어휘 시드 성공', seeded >= 30, `seeded=${seeded}`);
    // 리로드 후 today 진입 → boss 버튼 노출
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#screen-splash.active', { timeout: 3000 });
    await page.click('#btn-today');
    await page.waitForSelector('#screen-today.active', { timeout: 3000 });
    const bossBtn = await page.locator('#today-boss').count();
    check('US-004', '#today-boss 버튼 노출 (≥30 시)', bossBtn > 0, `btn=${bossBtn}`);
    if (bossBtn > 0) {
      await page.click('#today-boss');
      await page.waitForSelector('#screen-boss.active', { timeout: 4000 }).catch(() => {});
      const bossActive = await page.locator('#screen-boss.active').count() > 0;
      check('US-004', 'screen-boss.active', bossActive);
      const bossWord = await page.locator('.boss-word').first().textContent().catch(() => '');
      check('US-004', '.boss-word 표시', (bossWord || '').length >= 2, `word='${bossWord}'`);
      const slots = await page.locator('.boss-slot').count();
      const cards = await page.locator('.boss-card-btn').count();
      check('US-004', 'boss slots/cards 같은 수 ≥ 2', slots === cards && slots >= 2, `slots=${slots}, cards=${cards}`);
    } else {
      check('US-004', 'screen-boss 진입', false, 'boss 버튼이 없어 진입 불가');
    }

    // ============ US-007 종합 점검 ============
    console.log('\n=== US-007 콘솔/네트워크 종합 ===');
    stats.consoleErrors = errors.length;
    stats.networkFailures = failedRequests.length;
    check('US-007', '콘솔 에러 0건', errors.length === 0, errors.slice(0, 3).join(' | '));
    check('US-007', '네트워크 실패 0건', failedRequests.length === 0, failedRequests.slice(0, 3).join(' | '));

    // ============ 결과 로그 ============
    const log = [
      '=== Web Bot 자동 검증 결과 (Playwright headless) ===',
      `실행 시각: ${new Date().toISOString()}`,
      `통과: ${passed}, 실패: ${failed}`,
      `콘솔 에러: ${stats.consoleErrors}, 네트워크 실패: ${stats.networkFailures}`,
      '',
      '--- 상세 ---',
      ...results.map(r => `[${r.ok ? '✓' : '✘'}] ${r.id} ${r.name}${r.detail ? '  — ' + r.detail : ''}`),
      '',
      '--- 콘솔 에러 ---',
      ...errors.slice(0, 30),
      '',
      '--- 네트워크 실패 ---',
      ...failedRequests.slice(0, 30),
    ].join('\n');
    const log2 = log + '\n\n--- 모든 콘솔 로그 (앞 80개) ---\n' + allLogs.slice(0, 80).join('\n');
    mkdirSync(dirname(LOG_PATH), { recursive: true });
    writeFileSync(LOG_PATH, log2);
    console.log(`\n로그: ${LOG_PATH}`);
    console.log(`\n=== 최종: ${passed} pass / ${failed} fail ===`);
  } catch (err) {
    console.error('FATAL:', err);
    failed++;
    process.exitCode = 1;
  } finally {
    try { await browser?.close(); } catch {}
    stopServer(serverProc);
    if (failed > 0) process.exitCode = 1;
  }
}

main();
