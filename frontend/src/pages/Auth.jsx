/* ================= sign in, create account, onboarding ================= */
import {useState} from "react";
import {BUILTIN} from "../lib/courses.js";
import {S, nav, validRoute, signIn, createAccount, importBackup, toast, save, signOutLocal, notify} from "../lib/store.js";
import {Brand, CurveSVG} from "../components/common.jsx";

function afterAuth(){
  const sr = S.lastRoute;
  nav.route = sr && validRoute(sr) && sr !== "editskill" ? sr : "dashboard";
  notify();
}

export function Auth(){
  const [tab, setTab] = useState("signin");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({nm:"", em:"", pw:"", pw2:""});
  const [pendingRestore, setPendingRestore] = useState(null);
  const field = k => ({value:f[k], onChange:e => setF({...f, [k]:e.target.value})});
  const switchTab = t => { setTab(t); setErr(""); };

  const submit = async e => {
    e.preventDefault();
    const em = f.em.trim().toLowerCase(), pw = f.pw;
    try {
      if (tab === "signin") {
        if (!em || !pw) throw new Error("Enter your email and password.");
        setBusy(true);
        await signIn(em, pw);
      } else {
        const nm = f.nm.trim();
        if (!nm) throw new Error("Enter your name.");
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) throw new Error("Enter a valid email address.");
        if (pw.length < 8) throw new Error("Use a password of at least 8 characters.");
        if (pw !== f.pw2) throw new Error("The two passwords don’t match.");
        setBusy(true);
        await createAccount(nm, em, pw);
        if (pendingRestore) importBackup(pendingRestore, ok => { toast(ok ? "Backup restored" : "Couldn’t read that backup", ok); notify(); });
        else toast("Account created. Welcome, " + nm.split(" ")[0] + "!", true);
      }
      afterAuth();
    } catch (er) { setErr(er.message); setBusy(false); }
  };
  const restoreFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result); if (d.app !== "recall") throw 0;
        setTab("signup"); setErr("");
        setF({nm:(d.account && d.account.name) || "", em:(d.account && d.account.email) || "", pw:"", pw2:""});
        setPendingRestore(file);
        toast("Choose a password to finish restoring");
      } catch (er) { setErr("That file isn’t a Recall backup."); }
    };
    r.readAsText(file);
  };

  return (
    <div className="auth">
      <section className="auth-art">
        <Brand />
        <h1>Learn it once. Still know it in three months.</h1>
        <p className="sub">Notes, cheat sheets, flashcards, quizzes, mock interviews and code challenges for 20 courses, scheduled so each review lands right before you’d forget.</p>
        <figure className="curve" style={{margin:0}}><div><CurveSVG /></div>
          <figcaption className="cap"><span><i style={{background:"#F06B6F"}} />Read once, never reviewed</span><span><i style={{background:"var(--acc)"}} />Reviewed on day 1, 3 and 7</span></figcaption></figure>
      </section>
      <section className="auth-panel"><div className="auth-card">
        <div className="seg authseg" role="tablist"><button className={tab === "signin" ? "on" : ""} onClick={() => switchTab("signin")}>Sign in</button><button className={tab === "signup" ? "on" : ""} onClick={() => switchTab("signup")}>Create account</button></div>
        {tab === "signin" ? (<>
          <h2 style={{marginTop:20}}>Welcome back</h2>
          <p className="muted small">Your progress syncs across every device you sign in on.</p>
          <form onSubmit={submit} noValidate>
            <label className="lbl" htmlFor="em">Email</label><input className="input" id="em" type="email" autoComplete="username" autoFocus required {...field("em")} />
            <label className="lbl" htmlFor="pw" style={{marginTop:12}}>Password</label><input className="input" id="pw" type="password" autoComplete="current-password" required {...field("pw")} />
            {err ? <p className="formerr">{err}</p> : null}
            <button className="btn primary lg" style={{marginTop:16}} type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="fine">Have a backup file? <label className="link" htmlFor="restorefile" style={{cursor:"pointer"}}>Restore it into a new account</label><input type="file" id="restorefile" accept=".json,application/json" hidden onChange={restoreFile} /></p>
        </>) : (<>
          <h2 style={{marginTop:20}}>Create your account</h2>
          <p className="muted small">Free, and it takes ten seconds.</p>
          <form onSubmit={submit} noValidate>
            <label className="lbl" htmlFor="nm">Name</label><input className="input" id="nm" autoComplete="name" required {...field("nm")} />
            <label className="lbl" htmlFor="em" style={{marginTop:12}}>Email</label><input className="input" id="em" type="email" autoComplete="username" required {...field("em")} />
            <label className="lbl" htmlFor="pw" style={{marginTop:12}}>Password</label><input className="input" id="pw" type="password" autoComplete="new-password" minLength={8} required {...field("pw")} />
            <label className="lbl" htmlFor="pw2" style={{marginTop:12}}>Confirm password</label><input className="input" id="pw2" type="password" autoComplete="new-password" required {...field("pw2")} />
            {err ? <p className="formerr">{err}</p> : null}
            <button className="btn primary lg" style={{marginTop:16}} type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
          </form>
        </>)}
      </div></section>
    </div>
  );
}

const GOALS = [[10, "Light", "About 5 minutes a day"], [20, "Steady", "About 10 minutes a day"], [40, "Intense", "About 20 minutes a day"]];
export function Onboard(){
  const [goal, setGoal] = useState(S.prefs.goal);
  const [focus, setFocus] = useState(S.focus.slice());
  const toggle = id => { let n = focus.includes(id) ? focus.filter(x => x !== id) : focus.concat(id); if (!n.length) n = [id]; setFocus(n); };
  const start = () => { S.prefs.goal = goal; S.focus = focus; S.onboarded = true; save(); };
  return (
    <div className="auth"><section className="auth-art">
        <Brand />
        <h1>Set a pace you can keep.</h1>
        <p className="sub">Small daily reviews beat long sessions. You can change all of this later in Settings.</p>
        <figure className="curve" style={{margin:0}}><CurveSVG /></figure>
      </section>
      <section className="auth-panel"><div className="auth-card">
        <p className="muted small">Step 2 of 2</p>
        <h2>Your study plan</h2>
        <label className="lbl" style={{marginTop:18}}>Daily review goal</label>
        <div className="choice">{GOALS.map(g => <button key={g[0]} className={"opt-card" + (goal === g[0] ? " on" : "")} onClick={() => setGoal(g[0])}><div><b>{g[1]}, {g[0]} cards</b><small>{g[2]}</small></div></button>)}</div>
        <label className="lbl">What are you studying?</label>
        <div className="chips">{BUILTIN.map(w => <button key={w.id} className={"chip" + (focus.includes(w.id) ? " on" : "")} style={{"--wc":w.color}} onClick={() => toggle(w.id)}><span className="dot" />{w.name}</button>)}</div>
        <button className="btn primary lg" onClick={start}>Start learning</button>
        <p className="fine"><button className="link" onClick={signOutLocal}>Sign out</button></p>
      </div></section>
    </div>
  );
}
