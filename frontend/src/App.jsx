/* ================= app: boot, auth gate, page routing ================= */
import {useEffect, useState} from "react";
import {FMT} from "./lib/courses.js";
import {S, ME, WORLDS, BYID, nav, TITLES, overlay, syncState, useStore, restoreSession, startRoute, applyPrefs, save, toast, closeModal, setNavOpen, getKeyHandler} from "./lib/store.js";
import {Sidebar, TopBar} from "./components/Shell.jsx";
import {Toasts, ModalHost} from "./components/Overlay.jsx";
import {Auth, Onboard} from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import {Library, World} from "./pages/Library.jsx";
import Topic from "./pages/Topic.jsx";
import {Review, Boss, Cheats, Progress} from "./pages/Study.jsx";
import Settings from "./pages/Settings.jsx";
import Wizard from "./pages/Wizard.jsx";
import ModePage from "./pages/ModePage.jsx";

function useGlobalKeys(){
  useEffect(() => {
    const h = e => {
      if (overlay) { if (e.key === "Escape") closeModal(); return; }
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.altKey || e.ctrlKey || e.metaKey) return;
      const q = document.getElementById("q");
      if (e.key === "/" && q) { e.preventDefault(); q.focus(); return; }
      const k = getKeyHandler();
      if (k) k(e);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
}

function Page(){
  const r = nav.route, w = WORLDS.find(x => x.id === r);
  if (w && nav.boss === w.id) return <Boss w={w} />;
  if (r === "review") return <Review />;
  if (FMT[r]) return <ModePage mode={r} />;
  if (r === "library") return <Library />;
  if (r === "cheatsheets") return <Cheats />;
  if (r === "progress") return <Progress />;
  if (r === "settings") return <Settings />;
  if (r === "newskill" || r === "editskill") return <Wizard />;
  if (w) return <World w={w} />;
  if (BYID[r]) return <Topic t={BYID[r]} />;
  return <Dashboard />;
}

function Shell(){
  const r = nav.route, w = WORLDS.find(x => x.id === r);
  useEffect(() => { if (S.lastRoute !== r && r !== "editskill") { S.lastRoute = r; save(); } }, [r]);
  const title = w && nav.boss === w.id ? w.name + " boss battle" : TITLES[r] || (w ? w.name : BYID[r] ? BYID[r].t : "");
  return (
    <div className="shell">
      <Sidebar />
      <div className={"scrim" + (nav.navOpen ? " open" : "")} onClick={() => setNavOpen(false)} />
      <div className="main">
        <TopBar title={title} />
        <main className="page" id="page"><Page key={nav.route + ":" + nav.nonce} /></main>
      </div>
    </div>
  );
}

export default function App(){
  useStore();
  const [boot, setBoot] = useState(true);
  useEffect(() => {
    (async () => {
      const ok = await restoreSession();
      startRoute(ok);
      setBoot(false);
      if (ok && syncState === "offline") toast("Offline: changes will sync when the server is reachable");
    })();
  }, []);
  useEffect(() => { applyPrefs(); });
  useGlobalKeys();

  const body = boot ? <div className="boot"><span className="spin" /><span className="muted">Loading Recall…</span></div>
    : !ME.id ? <Auth /> : !S.onboarded ? <Onboard /> : <Shell />;
  return <>{body}<Toasts /><ModalHost /></>;
}
