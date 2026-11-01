/* ================= store: state, sync, learning model, navigation =================
   State lives in plain module variables (S, LIB, TC, ME, nav…) so the logic reads like before.
   Anything that changes them calls notify(), and every component using useStore() re-renders. */
import {useEffect, useRef, useSyncExternalStore} from "react";
import {API_URL} from "../config.js";
import {tday, shuffle} from "./text.js";
import {BUILTIN, ALL_FMTS, emptyTopic} from "./courses.js";

let version = 0;
const listeners = new Set();
export function notify(){ version++; listeners.forEach(l => l()); }
const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };
export const useStore = () => useSyncExternalStore(subscribe, () => version);

/* ================= state & persistence ================= */
const DEF_PREFS = {theme:"system", accent:"lagoon", size:"m", motion:true, goal:20, newLimit:10};
export function freshState(){ return {v:2, xp:0, streak:0, best:0, last:null, cards:{}, topics:{}, badges:[], reviews:0, bosses:{}, flawless:false, lastTopic:null, lastRoute:null, days:{}, newDay:{d:0, n:0}, prefs:Object.assign({}, DEF_PREFS), focus:["python", "numpy", "pandas", "pytorch"], signedIn:false, onboarded:false, prevLast:null, arena:{best:0, played:0}, nailed:0, updatedAt:0}; }
function normalize(o){
  const s = Object.assign(freshState(), o || {});
  s.prefs = Object.assign({}, DEF_PREFS, s.prefs || {});
  s.arena = Object.assign({best:0, played:0}, s.arena || {});
  return s;
}
export let S = freshState(), LIB = {skills:[], updatedAt:0}, TC = {};
export function resetProgress(){
  const keep = {prefs:S.prefs, focus:S.focus, onboarded:true, lastBackup:S.lastBackup};
  S = Object.assign(freshState(), keep); save();
}

export let WORLDS = [], ALL = [], BYID = {};
export function reindex(){
  const custom = LIB.skills.map(sk => ({id:sk.id, cat:"mine", name:sk.name, color:sk.color, icon:sk.icon, blurb:sk.goal || (sk.level ? sk.level + " level" : "Your own skill"), custom:true, skill:sk, formats:sk.formats,
    topics:sk.topics.map(st => { const c = TC[st.id]; return Object.assign(emptyTopic(st.id, st.t), c || {}, {id:st.id, t:(c && c.t) || st.t, planned:!c, lvl:(c && c.lvl) || "B"}); })}));
  WORLDS = BUILTIN.concat(custom);
  ALL = []; BYID = {};
  WORLDS.forEach(w => w.topics.forEach((t, i) => { t.world = w; t.idx = i; ALL.push(t); BYID[t.id] = t; }));
}
reindex();

/* ================= accounts & sync through the Recall backend (FastAPI) ================= */
const TOKEN_KEY = "recall-token", ME_KEY = "recall-me";
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
export const ME = {id:null, name:"", email:""};
let TOKEN = (() => { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } })();
const cacheKey = () => "recall-cache:" + ME.id;

class ApiError extends Error { constructor(msg, status){ super(msg); this.status = status; } }
async function api(path, opts){
  opts = opts || {};
  const headers = {"Content-Type":"application/json"};
  if (TOKEN) headers.Authorization = "Bearer " + TOKEN;
  let res;
  try {
    res = await fetch(API_URL + path, {method:opts.method || "GET", headers, body:opts.body ? JSON.stringify(opts.body) : undefined, keepalive:!!opts.keepalive});
  } catch (e) { throw new ApiError("Can’t reach the Recall server. Check that the backend is running.", 0); }
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    const d = data && data.detail;
    const msg = typeof d === "string" ? d : Array.isArray(d) ? d.map(x => x.msg).join(", ") : "Request failed (" + res.status + ")";
    throw new ApiError(msg, res.status);
  }
  return data;
}

function applyUserData(user, data){
  ME.id = user.id; ME.name = user.name; ME.email = user.email;
  lsSet(ME_KEY, user);
  S = normalize((data && data.progress) || {});
  LIB = Object.assign({skills:[], updatedAt:0}, (data && data.skills) || {});
  TC = (data && data.topics) || {};
  reindex();
  lsSet(cacheKey(), {progress:S, skills:LIB, topics:TC});
  notify();
}
export async function createAccount(name, email, pw){
  const r = await api("/api/auth/register", {method:"POST", body:{name, email, password:pw}});
  TOKEN = r.token; localStorage.setItem(TOKEN_KEY, TOKEN);
  applyUserData(r.user, null);
  await pushNow();
  return r.user;
}
export async function signIn(email, pw){
  const r = await api("/api/auth/login", {method:"POST", body:{email, password:pw}});
  TOKEN = r.token; localStorage.setItem(TOKEN_KEY, TOKEN);
  const data = await api("/api/data");
  applyUserData(r.user, data);
  return r.user;
}
export async function restoreSession(){
  if (!TOKEN) return false;
  try {
    const user = await api("/api/auth/me");
    const data = await api("/api/data");
    syncState = "saved";
    applyUserData(user, data);
    return true;
  } catch (e) {
    if (e.status === 401) { TOKEN = ""; localStorage.removeItem(TOKEN_KEY); return false; }
    const user = lsGet(ME_KEY, null);
    const cache = user && lsGet("recall-cache:" + user.id, null);
    if (user && cache) { syncState = "offline"; applyUserData(user, cache); return true; }
    return false;
  }
}
export function signOutLocal(){
  flushSave();
  TOKEN = ""; localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(ME_KEY);
  ME.id = null; ME.name = ""; ME.email = "";
  S = freshState(); LIB = {skills:[], updatedAt:0}; TC = {}; reindex();
  nav.route = "dashboard"; nav.boss = null;
  notify();
}
export async function updateAccount(patch){
  const user = await api("/api/auth/me", {method:"PATCH", body:patch});
  ME.name = user.name; lsSet(ME_KEY, user); notify();
  return user;
}
export async function changePassword(current, next){ await api("/api/auth/change-password", {method:"POST", body:{current_password:current, new_password:next}}); }
export async function deleteAccount(){ await api("/api/auth/me", {method:"DELETE"}); localStorage.removeItem(cacheKey()); }

/* saving: cached in the browser at once, pushed to the server shortly after */
export let syncState = "saved";
let saveTimer = null;
function payload(){ return {progress:S, skills:LIB, topics:TC}; }
async function pushNow(keepalive){
  clearTimeout(saveTimer);
  if (!ME.id || !TOKEN) return;
  lsSet(cacheKey(), payload());
  syncState = "saving"; notify();
  try { await api("/api/data", {method:"PUT", body:payload(), keepalive}); syncState = "saved"; }
  catch (e) { syncState = e.status === 0 ? "offline" : "error"; }
  notify();
}
function flushSave(){ if (ME.id) pushNow(true); }
function queueSave(){
  if (!ME.id) return;
  lsSet(cacheKey(), payload());
  syncState = "saving"; notify();
  clearTimeout(saveTimer); saveTimer = setTimeout(() => pushNow(false), 1200);
}
export function save(){ S.updatedAt = Date.now(); queueSave(); }
export function saveLib(){ LIB.updatedAt = Date.now(); queueSave(); }
export function saveTopic(id, obj){ TC[id] = obj; queueSave(); }
export function dropTopic(id){ delete TC[id]; queueSave(); }
export function removeSkill(id){ LIB.skills = LIB.skills.filter(x => x.id !== id); }
window.addEventListener("pagehide", flushSave);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushSave(); });
window.addEventListener("online", () => { if (syncState === "offline") pushNow(false); });
export function backupAge(){ return S.lastBackup ? Math.floor((Date.now() - S.lastBackup) / 864e5) : null; }

/* backups: move data between devices and keep it safe */
export function exportBackup(){
  flushSave();
  const data = {app:"recall", version:3, exported:new Date().toISOString(), account:{name:ME.name, email:ME.email}, progress:S, skills:LIB, topics:TC};
  const blob = new Blob([JSON.stringify(data)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "recall-backup-" + (ME.name || "me").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  S.lastBackup = Date.now(); save();
  toast("Backup downloaded");
}
export function importBackup(file, done){
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (d.app !== "recall" || !d.progress) throw 0;
      const keepPrefs = S.prefs;
      S = normalize(d.progress); S.prefs = Object.assign({}, keepPrefs, d.progress.prefs || {});
      S.onboarded = true;
      LIB = Object.assign({skills:[]}, d.skills || {}); TC = d.topics || {};
      reindex(); pushNow(false); done(true);
    } catch (e) { done(false); }
  };
  r.readAsText(file);
}

/* ================= learning model ================= */
export const IV = [0, 1, 3, 7, 16, 35, 75, 150], MAXBOX = 7;
export const cardKey = (t, i) => t.id + "#" + i;
export function cardR(st){
  if (!st) return null;
  const el = Math.max(0, tday() - (st.last == null ? tday() : st.last));
  return Math.pow(0.9, el / Math.max(1, IV[st.box] || 1));
}
export function topicStats(t){
  let seen = 0, boxSum = 0, rSum = 0;
  t.cards.forEach((c, i) => { const st = S.cards[cardKey(t, i)]; if (st) { seen++; boxSum += st.box; rSum += cardR(st); } });
  const rec = S.topics[t.id] || {};
  if (t.planned) return {seen:0, avgBox:0, ret:null, mastery:0, status:"planned", learned:false};
  const avgBox = t.cards.length ? boxSum / t.cards.length : 0;
  const ret = seen ? rSum / seen : null;
  let mastery = (rec.learned ? 25 : 0) + (rec.quiz || 0) * 0.35 + (t.cards.length ? boxSum / (t.cards.length * MAXBOX) * 40 : 0);
  let status = "new";
  if (seen && ret < 0.8) status = "fading";
  else if (rec.learned || seen) status = avgBox >= 3 ? "strong" : "learning";
  return {seen, avgBox, ret, mastery:Math.round(mastery), status, learned:!!rec.learned};
}
export function worldStats(w){
  if (!w.topics.length) return {mastery:0, ret:null, learned:0};
  let m = 0, rs = 0, rn = 0, l = 0;
  w.topics.forEach(t => { const s = topicStats(t); m += s.mastery; if (s.ret != null) { rs += s.ret; rn++; } if (s.learned) l++; });
  return {mastery:Math.round(m / w.topics.length), ret:rn ? rs / rn : null, learned:l};
}
export const topicRec = id => (S.topics[id] = S.topics[id] || {});
export const learnedCount = () => ALL.filter(t => S.topics[t.id] && S.topics[t.id].learned).length;
export const cardItem = (t, i) => ({id:cardKey(t, i), q:t.cards[i][0], a:t.cards[i][1], topic:t.t, color:t.world.color});
export const iqItems = t => t.iq.map(q => ({q:q[0], a:q[1], topic:t.t, color:t.world.color, tid:t.id}));
export const pracItems = t => t.prac.map(c => Object.assign({topic:t.t, color:t.world.color}, c));
export function prepQ(t, q){
  const order = shuffle(q[1].map((_, k) => k));
  return {q:q[0], opts:order.map(k => q[1][k]), ans:order.indexOf(q[2]), exp:q[3], topic:t.t, color:t.world.color};
}
export function newLeftToday(){ const d = tday(); return Math.max(0, S.prefs.newLimit - (S.newDay.d === d ? S.newDay.n : 0)); }
export function reviewQueue(mode){
  const d = tday(), due = [], fresh = [];
  ALL.forEach(t => t.cards.forEach((c, i) => {
    const st = S.cards[cardKey(t, i)];
    if (st) { if (st.due <= d) due.push({r:cardR(st), due:st.due, item:cardItem(t, i)}); }
    else if (S.topics[t.id] && S.topics[t.id].learned) fresh.push(cardItem(t, i));
  }));
  if (mode === "catchup") { due.sort((a, b) => a.r - b.r); return due.slice(0, Math.max(10, S.prefs.goal)).map(x => x.item); }
  due.sort((a, b) => a.due - b.due);
  return due.map(x => x.item).concat(fresh.slice(0, newLeftToday()));
}
export const reviewedToday = () => S.days[tday()] || 0;

/* ================= XP, levels, badges ================= */
export const level = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
export const lvlStart = l => (l - 1) * (l - 1) * 40, lvlEnd = l => l * l * 40;
const RANKS = ["Novice", "Apprentice", "Coder", "Debugger", "Tensor tamer", "Gradient surfer", "Model whisperer", "AI architect"];
export const rank = l => RANKS[Math.min(Math.floor((l - 1) / 2), RANKS.length - 1)];
export const currentStreak = () => (S.last === tday() || S.last === tday() - 1) ? S.streak : 0;
/* icon names map to MUI icons in components/icons.jsx */
export const BADGES = [
  {id:"first", icon:"first", name:"First page", how:"Learn your first topic", test:() => learnedCount() >= 1},
  {id:"tour", icon:"tour", name:"World tour", how:"Learn a topic in every library", test:() => BUILTIN.every(w => w.topics.some(t => S.topics[t.id] && S.topics[t.id].learned))},
  {id:"book", icon:"book", name:"Bookworm", how:"Learn 15 topics", test:() => learnedCount() >= 15},
  {id:"author", icon:"author", name:"Note taker", how:"Generate your first notes", test:() => Object.keys(TC).length > 0},
  {id:"skill", icon:"skill", name:"New skill", how:"Add a skill of your own", test:() => LIB.skills.some(x => x.id !== "notes")},
  {id:"arena", icon:"arena", name:"Arena regular", how:"Finish 5 practical runs", test:() => S.arena.played >= 5},
  {id:"interview", icon:"interview", name:"Interview ready", how:"Nail 25 mock interview answers", test:() => (S.nailed || 0) >= 25},
  {id:"shark", icon:"shark", name:"Card shark", how:"Review 50 cards", test:() => S.reviews >= 50},
  {id:"palace", icon:"palace", name:"Memory palace", how:"Review 300 cards", test:() => S.reviews >= 300},
  {id:"fire", icon:"fire", name:"On fire", how:"Keep a 3-day streak", test:() => currentStreak() >= 3},
  {id:"week", icon:"week", name:"Week warrior", how:"Keep a 7-day streak", test:() => currentStreak() >= 7},
  {id:"flawless", icon:"flawless", name:"Flawless", how:"Score 100% on a topic quiz", test:() => S.flawless},
  {id:"boss", icon:"boss", name:"Boss slayer", how:"Win a boss battle", test:() => Object.keys(S.bosses).length > 0},
  {id:"long", icon:"long", name:"Long-term memory", how:"Get a card to the 75-day box", test:() => Object.values(S.cards).some(c => c.box >= 6)},
  {id:"master", icon:"master", name:"Grandmaster", how:"80% mastery in all four libraries", test:() => BUILTIN.every(w => worldStats(w).mastery >= 80)}
];

/* ================= toasts & modals ================= */
export let toasts = [];
let toastId = 0;
export function toast(msg, gold){
  const id = ++toastId;
  toasts = toasts.concat({id, msg, gold:!!gold}); notify();
  setTimeout(() => { toasts = toasts.filter(t => t.id !== id); notify(); }, gold ? 3200 : 2000);
}
/* overlay: {kind:"confirm"|"levelup"|"custom", ...}; rendered by components/Overlay.jsx */
export let overlay = null;
export function openModal(m){ overlay = m; notify(); }
export function closeModal(){ if (overlay && overlay.resolve) overlay.resolve(false); overlay = null; notify(); }
export const confirmBox = (title, body, ok, danger) => new Promise(resolve => openModal({kind:"confirm", title, body, ok, danger, resolve}));

function touchStreak(){
  const d = tday();
  if (S.last === d) return;
  S.prevLast = S.last;
  S.streak = (S.last === d - 1) ? S.streak + 1 : 1;
  S.best = Math.max(S.best || 0, S.streak);
  S.last = d;
}
export function checkBadges(){
  BADGES.forEach(b => { if (!S.badges.includes(b.id) && b.test()) { S.badges.push(b.id); toast("Badge unlocked: " + b.name, true); save(); } });
}
export function gainXP(n, label, quiet){
  const before = level(S.xp);
  S.xp += n; touchStreak();
  if (!quiet) toast("+" + n + " XP  " + label);
  save(); checkBadges();
  const after = level(S.xp);
  if (after > before) openModal({kind:"levelup", level:after, rank:rank(after)});
}
export function applyGrade(id, g){
  const d = tday();
  const isNew = !S.cards[id];
  const c = Object.assign({box:0, due:d, seen:0, last:d}, S.cards[id]);
  if (g === "again") { c.box = 0; c.due = d; }
  else if (g === "hard") { c.box = Math.max(1, c.box); c.due = d + Math.max(1, Math.round(IV[c.box] / 2)); }
  else if (g === "good") { c.box = Math.min(MAXBOX, c.box + 1); c.due = d + IV[c.box]; }
  else { c.box = Math.min(MAXBOX, c.box + 2); c.due = d + IV[c.box]; }
  c.last = d; c.seen++;
  S.cards[id] = c; S.reviews++;
  S.days[d] = (S.days[d] || 0) + 1;
  if (isNew) { if (S.newDay.d !== d) S.newDay = {d, n:0}; S.newDay.n++; }
  Object.keys(S.days).forEach(k => { if (+k < d - 400) delete S.days[k]; });
  gainXP({again:1, hard:3, good:5, easy:6}[g], "card", true);
}

/* ================= preferences ================= */
const ROOT = document.documentElement;
const viewerTheme = ROOT.getAttribute("data-theme");
export function applyPrefs(){
  const p = S.prefs;
  ROOT.dataset.accent = p.accent;
  ROOT.dataset.size = p.size;
  ROOT.dataset.motion = p.motion ? "on" : "off";
  if (p.theme === "light" || p.theme === "dark") ROOT.setAttribute("data-theme", p.theme);
  else if (viewerTheme) ROOT.setAttribute("data-theme", viewerTheme);
  else ROOT.removeAttribute("data-theme");
}

/* ================= routing ================= */
const PAGES = ["dashboard", "review", "library", "cheatsheets", "progress", "settings", "newskill", "editskill", "notes", "cheat", "revision", "interview", "quiz", "practical"];
export const validRoute = r => PAGES.includes(r) || WORLDS.some(w => w.id === r) || !!BYID[r];
/* nonce changes on every navigation so the page remounts fresh, like the old full re-render */
export const nav = {route:"dashboard", tab:"notes", reviewMode:"daily", boss:null, editingTopic:null, navOpen:false, nonce:0};
/* small bits of UI state that survive page changes */
export const ui = {recallMode:false, csWorld:"python", csLearnedOnly:false};
export let wiz = null;
export const setWiz = w => { wiz = w; notify(); };
export function go(r, opts){
  if (r !== nav.route) nav.editingTopic = null;
  if (BYID[r] && r !== nav.route) nav.tab = (opts && opts.tab) || "notes";
  if (r === "editskill" && !wiz) r = "library";
  else if (BYID[r] && opts && opts.tab) nav.tab = opts.tab;
  if (r === "review") nav.reviewMode = (opts && opts.mode) || "daily";
  nav.route = validRoute(r) ? r : "dashboard";
  nav.boss = null; nav.navOpen = false; nav.nonce++;
  notify();
  window.scrollTo(0, 0);
  try { history.replaceState(null, "", "#" + nav.route); } catch (e) {}
}
export function setTab(tab){ nav.tab = tab; nav.nonce++; notify(); }
export function editTopic(id){ nav.editingTopic = id; notify(); }
export function setNavOpen(v){ nav.navOpen = v; notify(); }
export function startBoss(w){ nav.route = w.id; nav.boss = w.id; nav.nonce++; notify(); window.scrollTo(0, 0); }
export function goMode(mode, courseId){ S.modeCourse = Object.assign({}, S.modeCourse, {[mode]:courseId}); save(); go(mode); }
export function setModeCourse(mode, courseId){ S.modeCourse = Object.assign({}, S.modeCourse, {[mode]:courseId}); save(); window.scrollTo(0, 0); }
export function openCheats(worldId){ ui.csWorld = worldId; go("cheatsheets"); }
export function startRoute(signedIn){
  const startHash = location.hash.slice(1);
  if (validRoute(startHash)) nav.route = startHash;
  else if (signedIn && S.onboarded && S.lastRoute && validRoute(S.lastRoute) && S.lastRoute !== "editskill") nav.route = S.lastRoute;
  notify();
}
export const TITLES = {dashboard:"Dashboard", review:"Daily review", library:"All courses", cheatsheets:"Cheat sheets", progress:"Progress", settings:"Settings", newskill:"Add a course", editskill:"Edit course", notes:"Notes", cheat:"Cheat sheet", revision:"Revision", interview:"Interview", quiz:"Quiz", practical:"Practical"};

/* ================= keyboard ================= */
/* the active study session registers one handler; App's global listener calls it */
let keyHandler = null;
export const getKeyHandler = () => keyHandler;
export function useKeyHandler(fn){
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const h = e => ref.current && ref.current(e);
    keyHandler = h;
    return () => { if (keyHandler === h) keyHandler = null; };
  }, []);
}

/* ================= add / edit course ================= */
export function newWiz(){ return {step:1, editId:null, name:"", icon:"🧠", color:"#0E8580", level:"Beginner", goal:"", topicsText:"", formats:ALL_FMTS.slice()}; }
export function openEdit(id){
  const sk = LIB.skills.find(x => x.id === id); if (!sk) return;
  wiz = {step:1, editId:id, name:sk.name, icon:sk.icon, color:sk.color, level:sk.level || "Beginner", goal:sk.goal || "", topicsText:sk.topics.map(t => t.t).join("\n"), formats:sk.formats.slice()};
  go("editskill");
}
export function commitWizard(){
  const titles = wiz.topicsText.split("\n").map(x => x.trim()).filter(Boolean);
  if (!wiz.name.trim() || !titles.length || !wiz.formats.length) return;
  let sk;
  if (wiz.editId) {
    sk = LIB.skills.find(x => x.id === wiz.editId);
    const keepList = [];
    titles.forEach(title => { const ex = sk.topics.find(t => t.t.toLowerCase() === title.toLowerCase() || (TC[t.id] && TC[t.id].t.toLowerCase() === title.toLowerCase())); keepList.push(ex || {id:sk.id + "-" + Math.random().toString(36).slice(2, 8), t:title}); });
    sk.topics.filter(t => !keepList.includes(t)).forEach(t => { dropTopic(t.id); delete S.topics[t.id]; });
    Object.assign(sk, {name:wiz.name.trim(), icon:wiz.icon, color:wiz.color, level:wiz.level, goal:wiz.goal.trim(), formats:wiz.formats.slice(), topics:keepList});
  } else {
    const id = "s" + Date.now().toString(36);
    sk = {id, name:wiz.name.trim(), icon:wiz.icon, color:wiz.color, level:wiz.level, goal:wiz.goal.trim(), formats:wiz.formats.slice(), created:tday(), topics:titles.map((t, k) => ({id:id + "-" + k, t}))};
    LIB.skills.push(sk);
  }
  saveLib(); save(); reindex();
  const editing = !!wiz.editId;
  wiz = null;
  toast(editing ? "Course updated" : "Course added: " + sk.name, !editing);
  checkBadges();
  go(sk.id);
}
export function deleteWorldProgress(w){
  w.topics.forEach(t => { t.cards.forEach((c, i) => delete S.cards[cardKey(t, i)]); delete S.topics[t.id]; });
}
