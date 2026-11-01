/* ================= library, course cards & course page ================= */
import {useState} from "react";
import {CATS, BUILTIN, FMT} from "../lib/courses.js";
import {WORLDS, worldStats, topicStats, go, goMode, openEdit, openCheats, startBoss} from "../lib/store.js";
import {Crumbs, Fmt, Pill, Meter, Ring} from "../components/common.jsx";
import {Icon} from "../components/icons.jsx";
import {LVL} from "../lib/courses.js";

export function CourseSearch({value, onChange}){
  return <div className="pick-search"><Icon name="search" /><input className="input" placeholder="Search courses" value={value} onChange={e => onChange(e.target.value)} aria-label="Search courses" /></div>;
}

/* course cards grouped by category */
export function CourseGrid({list, onPick}){
  return CATS.map(cat => {
    const ws = list.filter(w => w.cat === cat.id);
    if (!ws.length) return null;
    return (<div key={cat.id}>
      <h2 className="cat-h">{cat.name}</h2>
      <div className="worldcards">{ws.map(w => { const s = worldStats(w); return (
        <button key={w.id} className="panel wcard" style={{"--wc":w.color}} onClick={() => onPick(w)}>
          <div className="row" style={{justifyContent:"space-between"}}><span style={{fontSize:"1.8rem"}}>{w.icon}</span><Ring p={s.mastery} small>{s.mastery}%</Ring></div>
          <span className="wn">{w.name}</span><span className="muted small">{w.blurb}</span>
          <span className="small" style={{marginTop:"auto"}}>{w.topics.length} topics, {s.learned} learned</span>
        </button>); })}</div>
    </div>);
  });
}

export function Library(){
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = WORLDS.filter(w => !q || w.name.toLowerCase().includes(q) || w.blurb.toLowerCase().includes(q));
  return (<>
    <div className="phead"><div><h1>All courses</h1><p>{BUILTIN.length} built-in courses with {BUILTIN.reduce((a, w) => a + w.topics.length, 0)} topics, from basic to advanced, plus your own.</p></div>
      <button className="btn primary" onClick={() => go("newskill")}><Icon name="plus" />Add a course</button></div>
    <CourseSearch value={query} onChange={setQuery} />
    <CourseGrid list={list} onPick={w => go(w.id)} />
  </>);
}

export function World({w}){
  const s = worldStats(w);
  const planned = w.topics.filter(t => t.planned).length;
  if (w.custom && !w.topics.length) return (<>
    <Crumbs parts={[w.name]} />
    <div className="panel empty"><span style={{fontSize:"2rem"}}>{w.icon}</span><h2 style={{margin:"10px 0 6px"}}>No topics yet</h2><p className="muted">Add topics to this course, then write notes for them.</p>
      <div className="row" style={{justifyContent:"center"}}><button className="btn primary" onClick={() => openEdit(w.id)}><Icon name="edit" />Add topics</button></div></div>
  </>);
  const qn = w.topics.reduce((a, t) => a + t.quiz.length, 0);
  const fmts = w.formats.map(f => FMT[f].name).join(", ");
  return (<>
    <Crumbs parts={[w.name]} />
    <section className="panel whero" style={{"--wc":w.color}}><span className="wi">{w.icon}</span>
      <div><h1>{w.name}</h1><p className="muted" style={{margin:".3em 0 0"}}>{w.blurb}{w.custom ? "" : ". Work through the topics in order."}</p>{w.custom ? <p className="muted small" style={{margin:".4em 0 0"}}>Formats: {fmts}</p> : null}</div>
      <div className="stats"><div className="stat"><b>{s.learned}/{w.topics.length}</b><span>learned</span></div><div className="stat"><b>{s.mastery}%</b><span>mastery</span></div><div className="stat"><b>{s.ret == null ? "–" : Math.round(s.ret * 100) + "%"}</b><span>recall today</span></div></div></section>
    {planned ? <div className="banner"><div><h3>{planned} topic{planned > 1 ? "s" : ""} still empty</h3><p className="muted" style={{margin:0}}>Open a topic and write its notes, flashcards and questions.</p></div></div> : null}
    <div className="row" style={{margin:"16px 0"}}>
      <button className="btn primary" disabled={qn < 4} onClick={() => startBoss(w)}><Icon name="bolt" />Boss battle</button>
      {["notes", "quiz", "practical", "interview", "revision"].filter(m => w.formats.includes(m)).map(m => <button key={m} className="btn" onClick={() => goMode(m, w.id)}><Icon name={FMT[m].icon} />{FMT[m].name}</button>)}
      {w.formats.includes("cheat") ? <button className="btn" onClick={() => openCheats(w.id)}><Icon name="sheet" />Cheat sheet</button> : null}
      {w.custom ? <button className="btn" onClick={() => openEdit(w.id)}><Icon name="edit" />Edit course</button> : null}</div>
    <div className="panel tbl-wrap"><table className="table"><thead><tr><th>#</th><th>Topic</th><th>Level & status</th><th>Memory strength</th><th>Mastery</th></tr></thead><tbody>
      {w.topics.map((t, i) => { const ts = topicStats(t); return (
        <tr key={t.id} tabIndex={0} onClick={() => go(t.id)} onKeyDown={e => { if (e.key === "Enter") go(t.id); }}>
          <td className="num">{i + 1}</td>
          <td><div className="tt">{t.t}</div>{t.planned ? <div className="th">Empty: open it to write notes</div> : <Fmt as="div" className="th" text={t.hook} />}</td>
          <td><span className={"lvl-tag lvl-" + (t.lvl || "B")}>{LVL[t.lvl || "B"]}</span> <Pill s={ts.status} /></td><td><Meter avg={ts.avgBox} color={w.color} /></td><td><b>{ts.mastery}%</b></td>
        </tr>); })}
    </tbody></table></div>
  </>);
}
