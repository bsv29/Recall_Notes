/* ================= shell: sidebar, top bar, search ================= */
import {useState} from "react";
import {plain} from "../lib/text.js";
import {FORMATS} from "../lib/courses.js";
import {S, ME, ALL, BYID, WORLDS, nav, syncState, level, lvlStart, lvlEnd, currentStreak, reviewQueue, go, setNavOpen, confirmBox, signOutLocal} from "../lib/store.js";
import {Brand, Dot} from "./common.jsx";
import {Icon} from "./icons.jsx";

export async function askSignOut(){
  if (await confirmBox("Sign out?", "Your progress is saved to your account.", "Sign out")) signOutLocal();
}

const SYNC_TEXT = {saving:"Saving…", offline:"Offline, will sync later", error:"Sync failed, retrying", saved:"All changes saved"};
const SYNC_STATE = {saved:"synced", saving:"syncing"};

export function Sidebar(){
  const due = reviewQueue().length;
  const cur = BYID[nav.route] ? "" : nav.route;
  const link = (r, ic, label, extra) => (
    <a key={r} href={"#" + r} className={cur === r ? "on" : ""} onClick={e => { e.preventDefault(); go(r); }}><Icon name={ic} /><span>{label}</span>{extra}</a>
  );
  return (
    <aside className={"side" + (nav.navOpen ? " open" : "")} id="side" aria-label="Main navigation">
      <Brand />
      <nav className="nav">
        {link("dashboard", "home", "Dashboard")}
        {link("library", "grid", "All courses", <span className="pct">{WORLDS.length}</span>)}
        <div className="nav-h">Study</div>
        {FORMATS.map(f => link(f.id, f.icon, f.name, f.id === "revision" && due ? <span className="count">{due}</span> : null))}
        <div className="nav-h">You</div>
        {link("progress", "chart", "Progress")}
        {link("newskill", "plus", "Add a course")}
        {link("settings", "gear", "Settings")}
      </nav>
      <div className="side-foot"><span className="avatar sm">{(ME.name || "G").charAt(0).toUpperCase()}</span>
        <div className="who"><b>{ME.name || "Guest"}</b><span id="sync" className="sync" data-state={SYNC_STATE[syncState] || "error"}>{SYNC_TEXT[syncState]}</span></div>
        <button className="btn sm" title="Sign out" aria-label="Sign out" onClick={askSignOut}><Icon name="out" /></button></div>
    </aside>
  );
}

function Search(){
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(-1);
  const s = q.trim().toLowerCase();
  let hits = [];
  if (s.length >= 2) {
    ALL.forEach(t => {
      if (t.planned && !t.t.toLowerCase().includes(s)) return;
      const hay = (t.t + " " + t.hook).toLowerCase();
      if (hay.includes(s)) hits.push({t, score:t.t.toLowerCase().includes(s) ? 0 : 1, sub:t.planned ? "Empty topic" : plain(t.hook)});
      else {
        const p = t.pts.find(x => x.toLowerCase().includes(s)) || (t.cards.find(c => c[0].toLowerCase().includes(s)) || [])[0];
        if (p) hits.push({t, score:2, sub:plain(p)});
      }
    });
    hits.sort((a, b) => a.score - b.score); hits = hits.slice(0, 8);
  }
  const pick = i => { const h = hits[i]; if (!h) return; setQ(""); setOpen(false); document.activeElement.blur(); go(h.t.id); };
  const onKey = e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(0, Math.min(hits.length - 1, sel + (e.key === "ArrowDown" ? 1 : -1)))); }
    else if (e.key === "Enter") pick(sel < 0 ? 0 : sel);
    else if (e.key === "Escape") { setQ(""); setOpen(false); e.target.blur(); }
  };
  return (
    <div className="search" role="search"><Icon name="search" />
      <input className="input" id="q" placeholder="Search topics and cards" autoComplete="off" aria-label="Search" value={q}
        onChange={e => { setQ(e.target.value); setSel(-1); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)} onKeyDown={onKey} />
      <kbd>/</kbd>
      <div className="results" hidden={!open || s.length < 2}>
        {hits.length ? hits.map((h, i) => (
          <button key={h.t.id} className={i === sel ? "sel" : ""} onMouseDown={e => { e.preventDefault(); pick(i); }}>
            <span className="rt"><Dot color={h.t.world.color} />{h.t.t}</span><span className="rs">{h.t.world.name}: {h.sub.replace(/`/g, "").slice(0, 90)}</span>
          </button>
        )) : <p className="muted small" style={{padding:"8px 10px", margin:0}}>No matches for “{q}”.</p>}
      </div>
    </div>
  );
}

export function TopBar({title}){
  const l = level(S.xp), a = lvlStart(l), b = lvlEnd(l);
  return (
    <header className="top">
      <button className="btn ghost sm menu" aria-label="Open menu" onClick={() => setNavOpen(true)}><Icon name="menu" /></button>
      <div className="ttl">{title}</div>
      <Search />
      <button className="hudchip hide-sm" title="Day streak" onClick={() => go("progress")}><Icon name="fire" /><span>{currentStreak()}</span></button>
      <button className="hudchip" title="Level" onClick={() => go("progress")}><b>Lv {l}</b><span className="bar"><span style={{width:(S.xp - a) / (b - a) * 100 + "%"}} /></span></button>
    </header>
  );
}
