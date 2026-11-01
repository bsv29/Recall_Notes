/* ================= add / edit course ================= */
import {useEffect} from "react";
import {FORMATS, FMT, ALL_FMTS, skillColors, skillIcons} from "../lib/courses.js";
import {S, LIB, WORLDS, nav, wiz, setWiz, newWiz, notify, toast, confirmBox, commitWizard, deleteWorldProgress, dropTopic, removeSkill, saveLib, save, reindex, go} from "../lib/store.js";
import {Crumbs} from "../components/common.jsx";
import {Icon} from "../components/icons.jsx";

function FmtPicker({sel, onToggle}){
  return (
    <div className="fmtpick">{FORMATS.map(f => (
      <label key={f.id} className={"fp" + (sel.includes(f.id) ? " on" : "")}><input type="checkbox" checked={sel.includes(f.id)} onChange={e => onToggle(f.id, e.target.checked)} /><Icon name={f.icon} /><span><b>{f.name}</b><small>{f.desc}</small></span></label>
    ))}</div>
  );
}

export default function Wizard(){
  const fresh = !wiz || (nav.route === "newskill" && wiz.editId);
  useEffect(() => { if (fresh) setWiz(newWiz()); }, [fresh]);
  if (fresh) return null;
  const W = wiz, set = patch => { Object.assign(W, patch); notify(); };
  const editing = !!W.editId;
  const topics = W.topicsText.split("\n").map(x => x.trim()).filter(Boolean);
  const steps = ["Course", "Topics", "Sections"];
  const toStep = s => { if (s > 1 && !W.name.trim()) { toast("Name the course first"); return; } set({step:s}); };
  const del = async () => {
    const sk = LIB.skills.find(x => x.id === W.editId); if (!sk) return;
    if (!(await confirmBox("Delete " + sk.name + "?", `All ${sk.topics.length} topics, their notes and your progress on them will be removed. This can’t be undone.`, "Delete course", true))) return;
    const w = WORLDS.find(x => x.id === sk.id);
    if (w) deleteWorldProgress(w);
    sk.topics.forEach(t => dropTopic(t.id));
    removeSkill(sk.id);
    saveLib(); save(); reindex(); setWiz(null); go("library");
  };
  return (<>
    <Crumbs parts={[editing ? "Edit course" : "Add a course"]} />
    <div className="phead"><div><h1>{editing ? "Edit " + W.name : "Add a course"}</h1><p>{editing ? "Change the details, add or remove topics, or choose different formats." : "Learning something new? Note down its topics and choose how you want to study it. Then write the notes topic by topic."}</p></div></div>
    <div className="stepper">{steps.map((s, k) => <button key={s} className={W.step === k + 1 ? "on" : W.step > k + 1 ? "done" : ""} onClick={() => toStep(k + 1)}><span>{k + 1}</span>{s}</button>)}</div>
    <section className="panel pad wiz">
      {W.step === 1 ? (<>
        <label className="lbl" htmlFor="wname">Course name</label><input className="input" id="wname" autoFocus placeholder="e.g. SQL, Docker, React, Statistics" value={W.name} onChange={e => set({name:e.target.value})} />
        <label className="lbl" style={{marginTop:16}}>Icon</label><div className="chips" style={{margin:"0 0 4px"}}>{skillIcons.map(ic => <button key={ic} className={"chip iconchip" + (W.icon === ic ? " on" : "")} onClick={() => set({icon:ic})}>{ic}</button>)}</div>
        <label className="lbl" style={{marginTop:12}}>Color</label><div className="swatches">{skillColors.map(c => <button key={c} className={"sw" + (W.color === c ? " on" : "")} style={{"--c":c}} aria-label={"Color " + c} onClick={() => set({color:c})} />)}</div>
        <label className="lbl" style={{marginTop:16}}>Your level</label><div className="seg">{["Beginner", "Intermediate", "Advanced"].map(l => <button key={l} className={W.level === l ? "on" : ""} onClick={() => set({level:l})}>{l}</button>)}</div>
        <label className="lbl" htmlFor="wgoal" style={{marginTop:16}}>Why are you learning it? (optional)</label><input className="input" id="wgoal" placeholder="e.g. Data analyst interviews, building a side project" value={W.goal} onChange={e => set({goal:e.target.value})} />
        <div className="row" style={{marginTop:20, justifyContent:"flex-end"}}><button className="btn primary" onClick={() => toStep(2)}>Next: topics</button></div>
      </>) : W.step === 2 ? (<>
        <div className="row" style={{justifyContent:"space-between", alignItems:"flex-end"}}><div><label className="lbl" htmlFor="wtopics" style={{margin:0}}>Topics, one per line</label><p className="muted small" style={{margin:"4px 0 0"}}>Note down what you plan to learn, from basic to advanced. The order becomes your level path.</p></div></div>
        <textarea className="input" id="wtopics" rows={12} style={{marginTop:10}} placeholder={"SELECT and filtering\nJoins\nGroup by and aggregates\nWindow functions"} value={W.topicsText} onChange={e => set({topicsText:e.target.value})} />
        <p className="muted small">{topics.length} topic{topics.length === 1 ? "" : "s"}</p>
        <div className="row" style={{marginTop:16, justifyContent:"space-between"}}><button className="btn" onClick={() => set({step:1})}>Back</button><button className="btn primary" disabled={!topics.length} onClick={() => set({step:3})}>Next: sections</button></div>
      </>) : (<>
        <label className="lbl">How do you want to study {W.name || "it"}?</label><p className="muted small" style={{margin:"0 0 10px"}}>These sections appear for every topic. You can change them later.</p>
        <FmtPicker sel={W.formats} onToggle={(id, on) => { const f = on ? W.formats.concat(id) : W.formats.filter(x => x !== id); set({formats:ALL_FMTS.filter(x => f.includes(x))}); }} />
        <div className="summary"><b>{W.icon} {W.name}</b><span className="muted small">{topics.length} topics, {W.formats.map(f => FMT[f].name.toLowerCase()).join(", ") || "no formats yet"}</span></div>
        <div className="row" style={{marginTop:16, justifyContent:"space-between"}}>
          <span className="row">{editing ? <button className="btn danger" onClick={del}><Icon name="trash" />Delete course</button> : null}<button className="btn" onClick={() => set({step:2})}>Back</button></span>
          <span className="row"><button className="btn primary" disabled={!W.formats.length} onClick={commitWizard}>{editing ? "Save changes" : "Create course"}</button></span></div>
      </>)}
    </section>
  </>);
}
