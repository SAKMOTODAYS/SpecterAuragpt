// ─── Key Vault (obfuscated — do not edit manually) ────────────────────────────
const _m = 99;
const _v = [
  [34,42,25,2,48,26,33,86,54,4,7,81,10,85,52,48,34,15,81,12,54,27,33,46,57,34,81,60,9,52,91,11,60,1,23,53,8,47,38],
  [34,42,25,2,48,26,33,10,39,4,47,12,2,23,9,37,12,84,37,37,90,32,2,8,82,0,10,33,49,50,49,84,40,33,37,20,36,23,83],
  [34,42,25,2,48,26,34,10,6,78,7,84,60,42,25,6,32,40,42,18,17,1,53,58,42,86,27,16,55,34,43,80,26,44,20,27,37,80,8],
  [34,42,25,2,48,26,32,20,21,33,20,23,50,53,49,20,53,18,18,1,9,90,10,41,59,4,82,51,9,32,2,57,8,32,41,52,4,58,50],
  [34,42,25,2,48,26,34,49,87,9,44,42,41,85,18,38,85,4,12,91,39,90,9,81,50,47,16,37,26,34,80,39,6,17,55,14,90,91,83],
  [34,42,25,2,48,26,34,60,85,47,44,59,10,33,51,59,8,7,18,84,39,14,83,78,57,33,58,43,42,57,36,17,40,13,13,16,21,91,46],
  [34,42,25,2,48,26,33,47,6,27,52,60,57,52,10,12,10,40,37,34,41,12,0,48,6,12,42,42,19,5,50,50,8,49,10,12,39,58,87],
  [34,42,25,2,48,26,34,16,18,51,4,36,40,16,7,34,33,27,33,37,78,1,7,51,2,52,0,2,11,49,42,41,49,10,55,10,51,59,4],
  [34,42,25,2,48,26,32,83,52,5,36,90,17,45,27,34,59,17,78,40,54,60,51,6,59,85,15,58,32,12,86,6,40,0,86,39,11,34,42],
  [34,42,25,2,48,26,32,27,41,9,49,19,14,32,1,83,5,16,22,15,50,60,17,45,39,10,82,47,91,11,82,38,5,50,60,9,41,39,58],
];
const _dk = a => a.map(n => String.fromCharCode(n ^ _m)).join('');
const GEMINI_KEYS   = _v.map(_dk);

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

let currentModelIdx = 0;
let currentKeyIdx   = 0;

function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEYS[currentKeyIdx]}`;
}

// ─── Firebase ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyA20I7CGobdE66NRHgZF5XX1JL3zetb8vM",
  authDomain:        "auraai-9d679.firebaseapp.com",
  projectId:         "auraai-9d679",
  storageBucket:     "auraai-9d679.firebasestorage.app",
  messagingSenderId: "672308129591",
  appId:             "1:672308129591:web:482460b3b1fa30c38274b2",
};

firebase.initializeApp(firebaseConfig);
const auth     = firebase.auth();
const db       = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// ─── DOM ──────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const loginScreen     = $("loginScreen");
const setupScreen     = $("setupScreen");
const chatApp         = $("chatApp");
const googleSignInBtn = $("googleSignInBtn");
const loginError      = $("loginError");
const avatarPicker    = $("avatarPicker");
const avatarPreview   = $("avatarPreview");
const avatarInput     = $("avatarInput");
const usernameInput   = $("usernameInput");
const startBtn        = $("startBtn");
const messagesEl      = $("messages");
const messageInput    = $("messageInput");
const sendBtn         = $("sendBtn");
const newChatBtn      = $("newChatBtn");
const chatHistory     = $("chatHistory");
const sidebar         = $("sidebar");
const menuToggle      = $("menuToggle");
const sidebarOverlay  = $("sidebarOverlay");
const sidebarAvatar   = $("sidebarAvatar");
const sidebarName     = $("sidebarName");
const sidebarEmail    = $("sidebarEmail");
const signoutBtn      = $("signoutBtn");
const welcomeTitle    = $("welcomeTitle");
const welcomeSub      = $("welcomeSub");
const themeToggle     = $("themeToggle");

// ─── State ────────────────────────────────────────────────────────────────────
let isLoading           = false;
let sessions            = [];
let currentSession      = null;
let currentUser         = null;
let customAvatar        = null;
let conversationHistory = [];

// ══════════════════════════════════════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════════════════════════════════════
function getTheme()    { return localStorage.getItem("aura-theme") || "dark"; }
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("aura-theme", t);
}

applyTheme(getTheme());

themeToggle.addEventListener("click", () => {
  applyTheme(getTheme() === "dark" ? "light" : "dark");
});

// ══════════════════════════════════════════════════════════════════════════════
//  FIREBASE AUTH
// ══════════════════════════════════════════════════════════════════════════════
auth.onAuthStateChanged(async user => {
  if (user) {
    const local = loadProfileLocal();
    if (local) {
      enterChat(user, local);
      loadProfileCloud(user.uid).then(cloud => {
        if (cloud) enterChat(user, cloud);
      });
    } else {
      const cloud = await loadProfileCloud(user.uid);
      if (cloud) {
        enterChat(user, cloud);
      } else {
        showSetupScreen(user);
      }
    }
  } else {
    showLogin();
  }
});

googleSignInBtn.addEventListener("click", async () => {
  googleSignInBtn.disabled = true;
  googleSignInBtn.querySelector("span").textContent = "Signing in…";
  loginError.style.display = "none";
  try {
    provider.setCustomParameters({ prompt: "select_account" });
    await auth.signInWithPopup(provider);
  } catch (err) {
    googleSignInBtn.disabled = false;
    googleSignInBtn.querySelector("span").textContent = "Continue with Google";
    showLoginErr(err);
  }
});

signoutBtn.addEventListener("click", async () => {
  const key = sessionsKey();
  localStorage.removeItem("aura-profile");
  localStorage.removeItem(key);
  await auth.signOut();
});

function showLoginErr(err) {
  const msgs = {
    "auth/popup-closed-by-user":    "Sign-in cancelled — please try again.",
    "auth/network-request-failed":  "Network error. Check your connection.",
    "auth/popup-blocked":           "Pop-up blocked! Allow pop-ups for this site.",
    "auth/operation-not-allowed":   "Google Sign-In is not enabled.",
    "auth/unauthorized-domain":     "This domain is not authorized.",
    "auth/internal-error":          "Firebase internal error.",
    "auth/configuration-not-found": "Firebase Authentication is not set up.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
  };
  const detail = msgs[err.code] || `Error: ${err.code || err.message}`;
  loginError.innerHTML = `⚠️ ${detail}`;
  loginError.style.display = "block";
}

function showLogin() {
  currentUser = null; customAvatar = null;
  conversationHistory = []; sessions = []; currentSession = null;
  chatApp.style.display     = "none";
  setupScreen.style.display = "none";
  loginScreen.style.display = "flex";
  loginScreen.classList.remove("fade-out");
  googleSignInBtn.disabled = false;
  googleSignInBtn.querySelector("span").textContent = "Continue with Google";
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROFILE SETUP
// ══════════════════════════════════════════════════════════════════════════════
let firebaseUser = null;

function showSetupScreen(user) {
  firebaseUser = user;
  loginScreen.classList.add("fade-out");
  setTimeout(() => {
    loginScreen.style.display  = "none";
    setupScreen.style.display  = "flex";
    usernameInput.value        = user.displayName || "";
    if (user.photoURL) {
      avatarPreview.src = user.photoURL;
      customAvatar      = user.photoURL;
    } else {
      avatarPreview.src = generateInitialAvatar(user.displayName || "U");
    }
  }, 320);
}

avatarPicker.addEventListener("click", () => avatarInput.click());
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    customAvatar      = e.target.result;
    avatarPreview.src = customAvatar;
  };
  reader.readAsDataURL(file);
});

startBtn.addEventListener("click", async () => {
  const name    = usernameInput.value.trim() || firebaseUser.displayName || "User";
  const profile = { name, avatar: customAvatar || firebaseUser.photoURL || "" };
  await saveProfile(profile, firebaseUser.uid);
  enterChat(firebaseUser, profile);
  setupScreen.classList.add("fade-out");
  setTimeout(() => setupScreen.style.display = "none", 320);
});

async function saveProfile(p, uid) {
  localStorage.setItem("aura-profile", JSON.stringify(p));
  if (uid) {
    try {
      await db.collection("users").doc(uid).set({ name: p.name, avatar: p.avatar }, { merge: true });
    } catch (e) { console.warn("Firestore saveProfile:", e); }
  }
}

async function loadProfileCloud(uid) {
  try {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      localStorage.setItem("aura-profile", JSON.stringify(data));
      return data;
    }
  } catch (e) { console.warn("Firestore loadProfile:", e); }
  return null;
}

function loadProfileLocal() {
  try { return JSON.parse(localStorage.getItem("aura-profile")); }
  catch { return null; }
}

async function clearProfile(uid) {
  localStorage.removeItem("aura-profile");
  if (uid) {
    try { await db.collection("users").doc(uid).delete(); } catch (e) {}
  }
}

function generateInitialAvatar(name) {
  const c = document.createElement("canvas");
  c.width = c.height = 96;
  const ctx  = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 96, 96);
  grad.addColorStop(0, "#7C6DFA");
  grad.addColorStop(1, "#a78bfa");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 96, 96);
  ctx.fillStyle      = "#fff";
  ctx.font           = "bold 40px sans-serif";
  ctx.textAlign      = "center";
  ctx.textBaseline   = "middle";
  ctx.fillText((name.charAt(0) || "U").toUpperCase(), 48, 50);
  return c.toDataURL();
}

// ══════════════════════════════════════════════════════════════════════════════
//  ENTER CHAT
// ══════════════════════════════════════════════════════════════════════════════
async function enterChat(user, profile) {
  currentUser = { ...user, displayName: profile.name, photoURL: profile.avatar };

  sidebarAvatar.src        = profile.avatar || generateInitialAvatar(profile.name);
  sidebarName.textContent  = profile.name;
  sidebarEmail.textContent = user.email || "";

  const first = profile.name.split(" ")[0];
  if (welcomeTitle) welcomeTitle.textContent = `Hello, ${first}! 👋`;
  if (welcomeSub)   welcomeSub.textContent   = "Ask me anything — code, ideas, analysis, or just chat.";

  // 1) Load local sessions immediately for instant display
  try {
    const raw = localStorage.getItem(sessionsKey());
    sessions = raw ? JSON.parse(raw) : [];
  } catch { sessions = []; }
  renderHistory();

  setupScreen.style.display = "none";
  loginScreen.style.display = "none";
  chatApp.style.display     = "flex";
  messageInput.focus();

  // 2) Then fetch from Firestore in background and update UI
  await loadSessions();
}

// ══════════════════════════════════════════════════════════════════════════════
//  SESSION PERSISTENCE
// ══════════════════════════════════════════════════════════════════════════════
function sessionsKey() {
  return `aura-sessions-${currentUser?.uid || "guest"}`;
}

async function saveSessions() {
  const slice = sessions.slice(0, 50);
  try {
    localStorage.setItem(sessionsKey(), JSON.stringify(slice));
  } catch {
    try { localStorage.setItem(sessionsKey(), JSON.stringify(sessions.slice(0, 20))); } catch {}
  }
  if (currentUser?.uid) {
    try {
      await db.collection("users").doc(currentUser.uid)
        .collection("sessions").doc("data")
        .set({ list: JSON.stringify(slice), updatedAt: Date.now() });
    } catch (e) { console.warn("Firestore saveSessions:", e); }
  }
}

async function loadSessions() {
  if (!currentUser?.uid) return;
  try {
    const doc = await db.collection("users").doc(currentUser.uid)
      .collection("sessions").doc("data").get();
    if (doc.exists) {
      const cloud = JSON.parse(doc.data().list || "[]");
      sessions = cloud;
      localStorage.setItem(sessionsKey(), JSON.stringify(cloud));
      renderHistory();
    }
  } catch (e) { console.warn("Firestore loadSessions:", e); }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SIDEBAR + MOBILE
// ══════════════════════════════════════════════════════════════════════════════
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarOverlay.classList.toggle("visible");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
});

newChatBtn.addEventListener("click", () => {
  startNewChat();
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
});

function startNewChat() {
  conversationHistory  = [];
  messagesEl.innerHTML = "";
  const welcome = $("welcome");
  if (welcome) {
    messagesEl.appendChild(welcome);
    welcome.querySelectorAll(".chip").forEach(attachChip);
    if (currentUser && welcomeTitle) {
      const first = currentUser.displayName.split(" ")[0];
      welcomeTitle.textContent = `Hello, ${first}! 👋`;
    }
  }
  messageInput.value        = "";
  messageInput.style.height = "auto";
  updateSend();
  currentSession = null;
  renderHistory();
}

// ══════════════════════════════════════════════════════════════════════════════
//  RESTORE SESSION
// ══════════════════════════════════════════════════════════════════════════════
function openSession(session) {
  currentSession      = session;
  conversationHistory = JSON.parse(JSON.stringify(session.history || []));

  messagesEl.innerHTML = "";
  (session.messages || []).forEach(m => appendMsg(m.role, m.text, false, true));

  renderHistory();
  scrollDown();
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
  messageInput.focus();
}

// ══════════════════════════════════════════════════════════════════════════════
//  INPUT
// ══════════════════════════════════════════════════════════════════════════════
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = Math.min(messageInput.scrollHeight, 180) + "px";
  updateSend();
});

messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!isLoading && messageInput.value.trim()) handleSend();
  }
});

sendBtn.addEventListener("click", handleSend);

function updateSend() {
  const ok = messageInput.value.trim().length > 0 && !isLoading;
  sendBtn.classList.toggle("active", ok);
  sendBtn.disabled = !ok;
}

document.querySelectorAll(".chip").forEach(attachChip);

function attachChip(chip) {
  chip.addEventListener("click", () => {
    messageInput.value        = chip.getAttribute("data-text");
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 180) + "px";
    updateSend();
    handleSend();
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  SCROLL
// ══════════════════════════════════════════════════════════════════════════════
function isNearBottom() {
  return messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 120;
}
function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }
function softScroll() { if (isNearBottom()) messagesEl.scrollTop = messagesEl.scrollHeight; }

// ══════════════════════════════════════════════════════════════════════════════
//  SEND + AI
// ══════════════════════════════════════════════════════════════════════════════
async function handleSend() {
  const text = messageInput.value.trim();
  if (!text || isLoading) return;

  isLoading = true;
  updateSend();

  const welcome = $("welcome");
  if (welcome) welcome.remove();

  messageInput.value        = "";
  messageInput.style.height = "auto";

  appendMsg("user", text);
  conversationHistory.push({ role: "user", parts: [{ text }] });

  if (!currentSession) createSession(text);

  const typing = showTyping();
  scrollDown();

  try {
    const reply = await fetchWithRetry(typing);
    typing.remove();
    const row    = appendMsg("ai", "");
    const bubble = row.querySelector(".bubble");
    await typeText(bubble, reply);
    conversationHistory.push({ role: "model", parts: [{ text: reply }] });

    currentSession.messages.push({ role: "user", text });
    currentSession.messages.push({ role: "ai",   text: reply });
    currentSession.history = JSON.parse(JSON.stringify(conversationHistory));
    saveSessions();

  } catch (err) {
    typing.remove();
    appendMsg("ai", errMsg(err), true);
  }

  isLoading = false;
  updateSend();
  softScroll();
  messageInput.focus();
}

// ══════════════════════════════════════════════════════════════════════════════
//  KEY COOLDOWN TRACKER
// ══════════════════════════════════════════════════════════════════════════════
const _cooldown   = {};
const COOLDOWN_MS = 62_000;

function _comboKey(k, m)   { return `${k}:${m}`; }
function _isCooling(k, m)  {
  const t = _cooldown[_comboKey(k, m)];
  return t && (Date.now() - t) < COOLDOWN_MS;
}
function _markCooling(k, m){ _cooldown[_comboKey(k, m)] = Date.now(); }

function _nextAvailable() {
  for (let m = 0; m < GEMINI_MODELS.length; m++) {
    for (let k = 0; k < GEMINI_KEYS.length; k++) {
      if (!_isCooling(k, m)) return { k, m };
    }
  }
  return null;
}

function _msUntilNext() {
  let earliest = Infinity;
  for (const t of Object.values(_cooldown)) {
    const remaining = COOLDOWN_MS - (Date.now() - t);
    if (remaining < earliest) earliest = remaining;
  }
  return Math.max(0, earliest) + 500;
}

// ══════════════════════════════════════════════════════════════════════════════
//  RETRY ENGINE
// ══════════════════════════════════════════════════════════════════════════════
async function fetchWithRetry(typing) {
  const isRateErr = err =>
    err.status === 429 ||
    err.status === 503 ||
    err.message?.includes("high demand")  ||
    err.message?.includes("overloaded")   ||
    err.message?.includes("UNAVAILABLE");

  const isDailyQuota = err =>
    (err.message?.includes("RESOURCE_EXHAUSTED") ||
     err.message?.includes("quota"))             &&
    !err.message?.includes("per minute")         &&
    !err.message?.includes("Rate");

  const deadline = Date.now() + 10 * 60_000;
  let   allDailyExhausted = false;

  while (Date.now() < deadline) {
    const combo = _nextAvailable();

    if (!combo) {
      if (allDailyExhausted) {
        const e = new Error("DAILY_QUOTA_ALL");
        e.dailyExhausted = true;
        throw e;
      }
      const wait = _msUntilNext();
      await countdown(typing, Math.ceil(wait / 1000));
      continue;
    }

    currentKeyIdx   = combo.k;
    currentModelIdx = combo.m;
    _silentDots(typing);

    try {
      return await callGemini();
    } catch (err) {
      if (isDailyQuota(err)) {
        _cooldown[_comboKey(combo.k, combo.m)] = Date.now() - COOLDOWN_MS + 23 * 60 * 60_000;
        allDailyExhausted = _nextAvailable() === null;
        continue;
      }
      if (isRateErr(err)) {
        _markCooling(combo.k, combo.m);
        allDailyExhausted = false;
        continue;
      }
      throw err;
    }
  }

  throw new Error("Service temporarily unavailable.");
}

function _silentDots(typing) {
  const b = typing.querySelector(".bubble");
  if (!b) return;
  b.innerHTML = "";
  b.appendChild(mkTypingDots());
  softScroll();
}

function countdown(typing, secs) {
  return new Promise(resolve => {
    const b = typing.querySelector(".bubble");
    let r   = secs;
    const draw = () => {
      if (!b) return;
      b.innerHTML = `<span style="font-size:13px;color:var(--text-2)">
        Please wait <strong style="color:var(--text-1)">${r}s</strong>…
      </span>`;
      softScroll();
    };
    draw();
    const t = setInterval(() => {
      r--;
      if (r <= 0) {
        clearInterval(t);
        _silentDots(typing);
        resolve();
      } else draw();
    }, 1000);
  });
}

// ── Gemini API call ───────────────────────────────────────────────────────────
async function callGemini() {
  const res = await fetch(geminiUrl(GEMINI_MODELS[currentModelIdx]), {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      contents: conversationHistory,
      generationConfig: {
        temperature:     0.9,
        topK:            40,
        topP:            0.95,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    const e = new Error(d?.error?.message || `HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }

  const data      = await res.json();
  const candidate = data?.candidates?.[0];
  const text      = candidate?.content?.parts?.[0]?.text ?? null;
  const stopReason = candidate?.finishReason ?? null;

  if (!text) throw new Error("Empty response.");

  if (stopReason === "MAX_TOKENS") {
    return text + "\n\n*(Response cut off — ask me to continue if needed.)*";
  }

  return text;
}

// ── Typing effect ─────────────────────────────────────────────────────────────
function typeText(el, text) {
  return new Promise(resolve => {
    el.classList.add("typing-cursor");
    let i = 0;
    const tick = () => {
      if (i >= text.length) {
        el.classList.remove("typing-cursor");
        resolve();
        return;
      }
      el.textContent += text.slice(i, Math.min(i + 4, text.length));
      i += 4;
      softScroll();
      setTimeout(tick, 12 + (Math.random() < 0.06 ? 50 : 0));
    };
    tick();
  });
}

// ── Message builders ──────────────────────────────────────────────────────────
function makeAiAvatar() {
  const id = `avG_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const av = document.createElement("div");
  av.className = "msg-avatar ai";
  av.innerHTML = `<svg viewBox="0 0 48 48" fill="none" style="width:100%;height:100%">
    <rect width="48" height="48" rx="50" fill="url(#${id})"/>
    <path d="M14 26L22 34L34 18" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C6DFA"/><stop offset="1" stop-color="#a78bfa"/>
    </linearGradient></defs>
  </svg>`;
  return av;
}

function appendMsg(role, text, isErr = false, silent = false) {
  const row    = document.createElement("div");
  row.className = `message-row ${role}`;
  const bubble  = document.createElement("div");
  bubble.className = `bubble${isErr ? " error" : ""}`;
  bubble.textContent = text;

  if (role === "user") {
    row.appendChild(bubble);
  } else {
    const wrap = document.createElement("div");
    wrap.className = "bubble-wrap";
    wrap.appendChild(makeAiAvatar());
    wrap.appendChild(bubble);
    row.appendChild(wrap);
  }

  messagesEl.appendChild(row);
  if (!silent) softScroll();
  return row;
}

function mkTypingDots() {
  const ind = document.createElement("div");
  ind.className = "typing-indicator";
  for (let i = 0; i < 3; i++) {
    const d = document.createElement("div");
    d.className = "typing-dot";
    ind.appendChild(d);
  }
  return ind;
}

function showTyping() {
  const row    = document.createElement("div");
  row.className = "message-row ai";
  const bubble  = document.createElement("div");
  bubble.className = "bubble";
  bubble.appendChild(mkTypingDots());
  const wrap = document.createElement("div");
  wrap.className = "bubble-wrap";
  wrap.appendChild(makeAiAvatar());
  wrap.appendChild(bubble);
  row.appendChild(wrap);
  messagesEl.appendChild(row);
  scrollDown();
  return row;
}

function errMsg(err) {
  if (!navigator.onLine)
    return "⚠️ No internet connection. Check your Wi-Fi and try again.";
  if (err.dailyExhausted)
    return "⚠️ Daily AI quota reached. Service will resume tomorrow at midnight (Pacific Time).";
  if (err.message?.includes("Service temporarily unavailable"))
    return "⚠️ AI is under heavy load right now. Please wait a few minutes and try again.";
  if (err.message?.includes("API key not valid") || err.status === 400)
    return "⚠️ Configuration error. Please contact support.";
  return `⚠️ Error: ${err.message || "Unknown error — please try again."}`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SESSION MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
function createSession(firstMsg) {
  const title = firstMsg.length > 45 ? firstMsg.slice(0, 45) + "…" : firstMsg;
  currentSession = { id: Date.now(), title, messages: [], history: [] };
  sessions.unshift(currentSession);
  saveSessions();
  renderHistory();
}

function renderHistory() {
  chatHistory.innerHTML = "";
  if (!sessions.length) {
    chatHistory.innerHTML = '<p class="history-empty">No conversations yet</p>';
    return;
  }
  sessions.forEach(s => {
    const el = document.createElement("div");
    el.className = `history-item${currentSession?.id === s.id ? " active" : ""}`;

    const titleSpan = document.createElement("span");
    titleSpan.className   = "history-title";
    titleSpan.textContent = s.title;
    titleSpan.title       = s.title;
    titleSpan.addEventListener("click", () => openSession(s));

    const delBtn = document.createElement("button");
    delBtn.className = "history-del";
    delBtn.title     = "Delete chat";
    delBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
    delBtn.addEventListener("click", e => { e.stopPropagation(); deleteSession(s.id); });

    el.appendChild(titleSpan);
    el.appendChild(delBtn);
    chatHistory.appendChild(el);
  });
}

async function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  if (currentSession?.id === id) {
    startNewChat();
  }
  renderHistory();
  await saveSessions();
}

updateSend();
