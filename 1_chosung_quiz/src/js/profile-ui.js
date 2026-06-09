/**
 * 프로필 UI — 칩 / 모달 / 생성 폼 렌더링 및 이벤트 핸들러
 */

import {
  listProfiles, getCurrentProfile, setCurrentProfile,
  createProfile, deleteProfile,
  PROFILE_EMOJIS, MAX_PROFILES, MAX_NAME_LENGTH,
} from './profiles.js';
import { $, $$ } from './utils.js';
import { loadSettings } from './storage.js';
import { renderSettings } from './settings.js';
import { showFlash } from './ui.js';

let pendingEmoji = PROFILE_EMOJIS[0];

/**
 * 시작 화면 상단 프로필 칩 갱신
 */
export function renderProfileChip() {
  const cur = getCurrentProfile();
  if (!cur) return;
  $('#profile-chip-emoji').textContent = cur.emoji;
  $('#profile-chip-name').textContent  = cur.name;
}

/**
 * 모달 내 프로필 목록 렌더링
 */
function renderProfileList() {
  const list = $('#profile-list');
  list.innerHTML = '';
  const cur = getCurrentProfile();
  const profiles = listProfiles();

  profiles.forEach(p => {
    const item = document.createElement('div');
    item.className = 'profile-item' + (p.id === cur?.id ? ' current' : '');
    item.onclick = (e) => {
      if (e.target.closest('.profile-item-delete')) return;
      selectProfile(p.id);
    };

    const emoji = document.createElement('span');
    emoji.className = 'profile-item-emoji';
    emoji.textContent = p.emoji;

    const name = document.createElement('span');
    name.className = 'profile-item-name';
    name.textContent = p.name;

    item.appendChild(emoji);
    item.appendChild(name);

    if (p.id === cur?.id) {
      const tag = document.createElement('span');
      tag.className = 'profile-item-current-tag';
      tag.textContent = '사용중';
      item.appendChild(tag);
    }

    // 삭제 버튼 — 프로필이 둘 이상일 때만
    if (profiles.length > 1) {
      const del = document.createElement('button');
      del.className = 'profile-item-delete';
      del.textContent = '✕';
      del.title = '삭제';
      del.onclick = (e) => {
        e.stopPropagation();
        handleDelete(p);
      };
      item.appendChild(del);
    }

    list.appendChild(item);
  });

  // "+ 새 프로필" 버튼 비활성화 (최대치 도달 시)
  $('#add-profile-btn').disabled = profiles.length >= MAX_PROFILES;
}

function renderEmojiPicker() {
  const picker = $('#emoji-picker');
  picker.innerHTML = '';
  PROFILE_EMOJIS.forEach(e => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-pick-btn' + (e === pendingEmoji ? ' selected' : '');
    btn.textContent = e;
    btn.onclick = () => {
      pendingEmoji = e;
      renderEmojiPicker();
    };
    picker.appendChild(btn);
  });
}

/* ---------------- 공개 핸들러 (HTML onclick에서 호출) ---------------- */

export function openProfileModal() {
  renderProfileList();
  $('#profile-modal').style.display = 'flex';
  $('#create-profile-form').style.display = 'none';
}

export function closeProfileModal() {
  $('#profile-modal').style.display = 'none';
}

export function closeProfileModalBg(e) {
  if (e.target.id === 'profile-modal') closeProfileModal();
}

export function showCreateProfileForm() {
  pendingEmoji = PROFILE_EMOJIS[0];
  $('#new-profile-name').value = '';
  renderEmojiPicker();
  $('#create-profile-form').style.display = 'flex';
  $('#new-profile-name').focus();
}

export function cancelCreateProfile() {
  $('#create-profile-form').style.display = 'none';
}

export function confirmCreateProfile() {
  const name = $('#new-profile-name').value.trim();
  if (!name) {
    showFlash('이름을 입력해주세요');
    return;
  }
  if (name.length > MAX_NAME_LENGTH) {
    showFlash(`이름은 ${MAX_NAME_LENGTH}자 이하로`);
    return;
  }
  const p = createProfile(name, pendingEmoji);
  if (!p) {
    showFlash('프로필을 더 만들 수 없어요');
    return;
  }
  // 새 프로필은 기본 설정으로 시작
  loadSettings();
  renderSettings();
  renderProfileChip();
  renderProfileList();
  $('#create-profile-form').style.display = 'none';
}

function selectProfile(id) {
  const cur = getCurrentProfile();
  if (cur && cur.id === id) {
    closeProfileModal();
    return;
  }
  setCurrentProfile(id);
  loadSettings();
  renderSettings();
  renderProfileChip();
  closeProfileModal();
}

function handleDelete(profile) {
  if (!confirm(`"${profile.name}" 프로필을 삭제할까요? 설정도 함께 사라집니다.`)) return;
  const wasCurrent = getCurrentProfile()?.id === profile.id;
  if (!deleteProfile(profile.id)) {
    showFlash('삭제할 수 없어요 (최소 1개 필요)');
    return;
  }
  if (wasCurrent) {
    loadSettings();
    renderSettings();
    renderProfileChip();
  }
  renderProfileList();
}
