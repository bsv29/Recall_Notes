/* ================= settings ================= */
import {useState} from "react";
import {BUILTIN} from "../lib/courses.js";
import {S, ME, LIB, save, applyPrefs, notify, toast, openModal, confirmBox, updateAccount, changePassword, deleteAccount, signOutLocal, exportBackup, importBackup, backupAge, resetProgress, go, openEdit} from "../lib/store.js";
import {askSignOut} from "../components/Shell.jsx";
import {Icon} from "../components/icons.jsx";

const ACCENTS = [["lagoon", "#0E8580"], ["ember", "#C94A22"], ["iris", "#5B45D6"], ["gold", "#9A6B00"]];

function ChangePassword({close}){
  const [cur, setCur] = useState(""), [np, setNp] = useState(""), [err, setErr] = useState("");
  const submit = async () => {
    if (np.length < 8) { setErr("Use at least 8 characters."); return; }
    try { await changePassword(cur, np); close(); toast("Password changed"); }
    catch (e) { setErr(e.message); }
  };
  return (<>
    <h2>Change password</h2>
    <label className="lbl" htmlFor="opw">Current password</label><input className="input" id="opw" type="password" data-focus value={cur} onChange={e => setCur(e.target.value)} />
    <label className="lbl" htmlFor="npw" style={{marginTop:10}}>New password</label><input className="input" id="npw" type="password" value={np} onChange={e => setNp(e.target.value)} />
    {err ? <p className="formerr">{err}</p> : null}
    <div className="row"><button className="btn" onClick={close}>Cancel</button><button className="btn primary" onClick={submit}>Change password</button></div>
  </>);
}

function Set({title, desc, children}){
  return <div className="set"><div><h3>{title}</h3>{desc ? <p>{desc}</p> : null}</div><div>{children}</div></div>;
}

export default function Settings(){
  const p = S.prefs;
  const [name, setName] = useState(ME.name);
  const setPref = (k, v) => { p[k] = v; save(); applyPrefs(); };
  const seg = (k, vals) => <div className="seg">{vals.map(v => <button key={v[0]} className={String(p[k]) === String(v[0]) ? "on" : ""} onClick={() => setPref(k, v[0])}>{v[1]}</button>)}</div>;
  const toggleFocus = id => { S.focus = S.focus.includes(id) ? S.focus.filter(x => x !== id) : S.focus.concat(id); if (!S.focus.length) S.focus = [id]; save(); };
  const saveName = async () => { const v = name.trim(); if (!v) return toast("Enter a name"); try { await updateAccount({name:v}); toast("Name saved"); } catch (e) { toast(e.message); } };
  const restore = async e => {
    const file = e.target.files[0]; e.target.value = ""; if (!file) return;
    if (!(await confirmBox("Restore this backup?", "It replaces the skills, notes and progress in this account with the ones in the file.", "Restore"))) return;
    importBackup(file, ok => { toast(ok ? "Backup restored" : "That file isn’t a Recall backup", ok); notify(); });
  };
  const delAcct = async () => {
    if (!(await confirmBox("Delete your account?", "Your account, courses, notes and progress will be permanently deleted from the server. Download a backup first if you might want them later.", "Delete account", true))) return;
    try { await deleteAccount(); signOutLocal(); toast("Account deleted"); }
    catch (e) { toast(e.message); }
  };
  const reset = async () => {
    if (!(await confirmBox("Reset all progress?", "XP, streaks, badges, card schedules and quiz scores will be cleared. This can’t be undone.", "Reset progress", true))) return;
    resetProgress(); toast("Progress reset");
  };
  const age = backupAge();
  return (<>
    <div className="phead"><div><h1>Settings</h1><p>Appearance, study plan and account.</p></div></div>
    <section className="panel" style={{marginBottom:16}}>
      <Set title="Theme" desc="System follows your device.">{seg("theme", [["system", "System"], ["light", "Light"], ["dark", "Dark"]])}</Set>
      <Set title="Accent color" desc="Used for buttons, progress and highlights.">
        <div className="swatches">{ACCENTS.map(a => <button key={a[0]} className={"sw" + (p.accent === a[0] ? " on" : "")} style={{"--c":a[1]}} aria-label={a[0]} onClick={() => setPref("accent", a[0])} />)}</div></Set>
      <Set title="Text size">{seg("size", [["s", "Small"], ["m", "Medium"], ["l", "Large"]])}</Set>
      <Set title="Animations" desc="Card flips and level-up effects."><label className="switch"><input type="checkbox" checked={p.motion} onChange={e => setPref("motion", e.target.checked)} />{p.motion ? "On" : "Off"}</label></Set>
    </section>
    <section className="panel" style={{marginBottom:16}}>
      <Set title="Daily goal" desc="Cards to review each day.">{seg("goal", [[10, "10"], [20, "20"], [40, "40"], [60, "60"]])}</Set>
      <Set title="New cards per day" desc="Fewer new cards keeps reviews manageable later.">{seg("newLimit", [[5, "5"], [10, "10"], [20, "20"], [40, "40"]])}</Set>
      <Set title="Focus areas" desc="Shape the “Up next” list on your dashboard.">
        <div className="chips" style={{margin:0}}>{BUILTIN.map(w => <button key={w.id} className={"chip" + (S.focus.includes(w.id) ? " on" : "")} style={{"--wc":w.color}} onClick={() => toggleFocus(w.id)}><span className="dot" />{w.name}</button>)}</div></Set>
    </section>
    <section className="panel" style={{marginBottom:16}}>
      <Set title="Account" desc="Your name and sign-in details. Progress syncs to the Recall server.">
        <div className="grid g2" style={{gap:12}}><div><label className="lbl" htmlFor="aname">Name</label><input className="input" id="aname" value={name} onChange={e => setName(e.target.value)} /></div><div><label className="lbl">Email</label><input className="input" value={ME.email} disabled /></div></div>
        <div className="row" style={{marginTop:12}}><button className="btn" onClick={saveName}>Save name</button><button className="btn" onClick={() => openModal({kind:"custom", render:close => <ChangePassword close={close} />})}>Change password</button><span className="spacer" /><button className="btn" onClick={askSignOut}><Icon name="out" />Sign out</button></div>
      </Set>
    </section>
    <section className="panel" style={{marginBottom:16}}>
      <Set title="Backup" desc="Everything already syncs to the server. A backup file is an extra copy you control.">
        <p className="small" style={{margin:"0 0 10px"}}>{age == null ? "No backup yet." : age === 0 ? "Last backup: today." : `Last backup: ${age} day${age === 1 ? "" : "s"} ago.`}</p>
        <div className="row"><button className="btn primary" onClick={exportBackup}>Download backup</button><label className="btn" htmlFor="impfile">Restore from file</label><input type="file" id="impfile" accept=".json,application/json" hidden onChange={restore} /></div>
      </Set>
    </section>
    <section className="panel" style={{marginBottom:16}}>
      <Set title="Reset progress" desc="Clears XP, streaks, card schedules and quiz scores. Your skills and notes stay."><button className="btn danger" onClick={reset}>Reset progress</button></Set>
      <Set title="Delete account" desc="Removes this account and all its data from the server."><button className="btn danger" onClick={delAcct}>Delete account</button></Set>
      <Set title="Your courses" desc="Rename, add topics, change sections or delete a course you added.">
        <div className="row">{LIB.skills.length ? LIB.skills.map(sk => <button key={sk.id} className="chip" onClick={() => openEdit(sk.id)}>{sk.icon} {sk.name}</button>) : <button className="btn" onClick={() => go("newskill")}><Icon name="plus" />Add a course</button>}</div>
      </Set>
    </section>
  </>);
}
