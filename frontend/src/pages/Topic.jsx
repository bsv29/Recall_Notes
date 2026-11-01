/* ================= topic page ================= */
import {useEffect, useRef, useState} from "react";
import {tday, shuffle} from "../lib/text.js";
import {FMT, LVL, topicFormats} from "../lib/courses.js";
import {S, TC, nav, ui, topicRec, topicStats, cardKey, cardItem, iqItems, pracItems, prepQ, gainXP, save, saveLib, saveTopic, dropTopic, reindex, go, setTab, editTopic, startBoss, confirmBox, toast, notify} from "../lib/store.js";
import {Crumbs, Fmt, Code, Pill, Meter, CopyBtn, PrintBtn, CheatCard} from "../components/common.jsx";
import {Visual, Lesson, Checkpoint} from "../components/TopicParts.jsx";
import {Icon, Glyph} from "../components/icons.jsx";
import CardSession from "../components/sessions/CardSession.jsx";
import QuizSession from "../components/sessions/QuizSession.jsx";
import ArenaSession from "../components/sessions/ArenaSession.jsx";
import InterviewSession from "../components/sessions/InterviewSession.jsx";

function NoteBox({t}){
  const rec = S.topics[t.id] || {};
  const [val, setVal] = useState(rec.note || "");
  const [state, setState] = useState(rec.note ? "Saved" : "");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const change = e => {
    const v = e.target.value; setVal(v); setState("Saving…");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { topicRec(t.id).note = v; save(); setState("Saved"); }, 500);
  };
  return (
    <section className="panel section"><div className="shead"><h2>Your notes</h2><span className="muted small">{state}</span></div>
      <p className="muted small" style={{margin:"0 0 8px"}}>Write it in your own words or add an example. Explaining it yourself is one of the strongest memory boosters.</p>
      <textarea className="input" placeholder="e.g. In my project I used this when…" value={val} onChange={change} /></section>
  );
}

function RecallPoint({p, hidden}){
  const [shown, setShown] = useState(false);
  if (!hidden) return <li><Fmt className="pt" text={p} /></li>;
  const rv = () => setShown(!shown);
  return <li className={shown ? "shown" : ""} tabIndex={0} role="button" aria-label="Reveal point" onClick={rv} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); rv(); } }}><Fmt className="pt" text={p} /></li>;
}

function NotesTab({t}){
  const w = t.world, ts = topicStats(t), rec = S.topics[t.id] || {};
  const recallMode = ui.recallMode;
  const markLearned = () => { topicRec(t.id).learned = true; gainXP(20, "topic learned"); };
  const delTopic = async () => {
    if (!(await confirmBox("Delete this topic?", `“${t.t}” and its cards will be removed from ${w.name}.`, "Delete", true))) return;
    w.skill.topics = w.skill.topics.filter(x => x.id !== t.id);
    t.cards.forEach((c, i) => delete S.cards[cardKey(t, i)]); delete S.topics[t.id];
    dropTopic(t.id); saveLib(); save(); reindex(); go(w.id);
  };
  return (
    <div className="tlayout"><div>
      {t.hook ? <div className="panel hookbox"><div className="kicker"><Icon name="brain" />Remember it by</div><Fmt as="p" className="hk" text={t.hook} /></div> : null}
      {t.sum ? <Fmt as="p" className="lead" text={t.sum} /> : null}
      <section className="panel section visbox" style={{"--wc":w.color}}><div className="kicker"><Icon name="grid" />See it</div><Visual t={t} /></section>
      {t.doc ? <Lesson t={t} /> : null}
      <section className="panel section"><div className="shead"><h2>{t.doc ? "Summary: key points" : "Key points"}</h2>
          <label className="switch"><input type="checkbox" checked={recallMode} onChange={e => { ui.recallMode = e.target.checked; notify(); }} />Recall mode</label></div>
        {recallMode ? <p className="muted small" style={{margin:"0 0 6px"}}>Say each point from memory, then tap it to check. Retrieval is what makes it stick.</p> : null}
        <ol className={"points" + (recallMode ? " hidden" : "")}>{t.pts.map((p, k) => <RecallPoint key={k + (recallMode ? "h" : "")} p={p} hidden={recallMode} />)}</ol></section>
      {t.code && !t.doc ? <section className="codewrap"><div className="codehead"><span>Example</span><CopyBtn text={t.code} /></div><Code code={t.code} /></section> : null}
      {t.traps.length ? <section className="panel section traps"><h3>Interview traps</h3><ul>{t.traps.map((x, k) => <Fmt key={k} as="li" text={x} />)}</ul></section> : null}
      <Checkpoint t={t} />
      <NoteBox t={t} />
    </div>
    <aside className="panel pad aside-card"><h3 style={{marginBottom:8}}>Your progress</h3>
      <div className="kv"><span>Status</span><Pill s={ts.status} /></div>
      <div className="kv"><span>Mastery</span><b>{ts.mastery}%</b></div>
      <div className="kv"><span>Recall today</span><b>{ts.ret == null ? "–" : Math.round(ts.ret * 100) + "%"}</b></div>
      <div className="kv"><span>Strength</span><Meter avg={ts.avgBox} color={w.color} /></div>
      {t.doc ? <div className="kv"><span>Lesson read</span><b>{(rec.read || []).length}/{t.doc.length}</b></div> : null}
      <div className="kv"><span>Best quiz</span><b>{rec.quiz != null ? rec.quiz + "%" : "–"}</b></div>
      <div className="kv"><span>Arena</span><b>{rec.stars ? <span className="stars-sm" style={{marginLeft:0}}>{[0, 1, 2].map(k => <Glyph key={k} name={k < rec.stars ? "star" : "starOff"} />)}</span> : "–"}</b></div>
      <div style={{display:"grid", gap:8, marginTop:14}}>
        {rec.learned ? <span className="pill strong" style={{justifyContent:"center", padding:".5em"}}>Learned, cards are in your review</span>
          : <><button className="btn primary" onClick={markLearned}>Mark as learned, +20 XP</button>
              <button className="btn" onClick={() => { const cp = document.getElementById("cp"); if (cp) cp.scrollIntoView({behavior:"smooth", block:"center"}); }}><Icon name="bolt" />Go to checkpoint</button></>}
        {topicFormats(t).includes("practical") ? <button className="btn" onClick={() => setTab("practical")}><Icon name="code" />Enter the arena</button> : null}
        {w.custom ? <><button className="btn" onClick={() => editTopic(t.id)}><Icon name="edit" />Edit content</button><button className="btn danger" onClick={delTopic}><Icon name="trash" />Delete topic</button></> : null}
      </div>
      {rec.learned || !t.cards.length ? null : <p className="muted small" style={{margin:"10px 0 0"}}>Marking it learned adds its {t.cards.length} flashcards to your daily review.</p>}
    </aside></div>
  );
}

function Editor({t}){
  const c = TC[t.id] || {};
  const lines = a => (a || []).join("\n");
  const pairs = a => (a || []).map(x => x[0] + " | " + x[1]).join("\n");
  const quizTxt = (c.quiz || []).map(q => [q[0], q[1][q[2]]].concat(q[1].filter((_, k) => k !== q[2])).join(" | ")).join("\n");
  const [f, setF] = useState({t:c.t || t.t, h:c.hook || "", s:c.sum || "", p:lines(c.pts), c:c.code || "", tr:lines(c.traps), fc:pairs(c.cards), i:pairs(c.iq), q:quizTxt});
  const [err, setErr] = useState("");
  const bind = k => ({value:f[k], onChange:e => setF({...f, [k]:e.target.value})});
  const saveIt = () => {
    const v = k => f[k].trim();
    const ls = k => v(k).split("\n").map(x => x.trim()).filter(Boolean);
    const pr = k => ls(k).map(x => x.split("|").map(y => y.trim())).filter(x => x.length >= 2 && x[0] && x[1]).map(x => [x[0], x.slice(1).join(" | ")]);
    const quiz = ls("q").map(x => x.split("|").map(y => y.trim()).filter(Boolean)).filter(x => x.length >= 3).map(x => [x[0], x.slice(1, 5), 0, "The correct answer is: " + x[1]]);
    const obj = {t:v("t") || t.t, hook:v("h"), sum:v("s"), pts:ls("p"), code:f.c.replace(/\s+$/, ""), traps:ls("tr"), cards:pr("fc"), iq:pr("i"), quiz};
    if (!obj.pts.length && !obj.cards.length && !obj.quiz.length && !obj.iq.length) { setErr("Add at least some key points, flashcards, interview questions or quiz questions."); return; }
    saveTopic(t.id, Object.assign({}, c, obj, {id:t.id, prac:c.prac || [], created:c.created || tday()}));
    const st = t.world.skill.topics.find(x => x.id === t.id); if (st) st.t = obj.t;
    saveLib(); reindex(); nav.editingTopic = null;
    toast("Notes saved");
  };
  return (
    <section className="panel pad editor" style={{marginTop:18}}>
      <div className="shead"><h2>{c.pts ? "Edit content" : "Write the notes yourself"}</h2><span className="muted small">Separate question and answer with a <code>|</code></span></div>
      <div className="grid g2" style={{gap:12}}><div><label className="lbl" htmlFor="e_t">Title</label><input className="input" id="e_t" {...bind("t")} /></div>
        <div><label className="lbl" htmlFor="e_h">Brain hook (one memorable line)</label><input className="input" id="e_h" {...bind("h")} /></div></div>
      <label className="lbl" htmlFor="e_s" style={{marginTop:12}}>Summary</label><textarea className="input" id="e_s" rows={2} {...bind("s")} />
      <label className="lbl" htmlFor="e_p" style={{marginTop:12}}>Key points, one per line</label><textarea className="input" id="e_p" rows={6} placeholder="Use `backticks` for code" {...bind("p")} />
      <label className="lbl" htmlFor="e_c" style={{marginTop:12}}>Code example</label><textarea className="input mono" id="e_c" rows={6} {...bind("c")} />
      <label className="lbl" htmlFor="e_tr" style={{marginTop:12}}>Interview traps, one per line</label><textarea className="input" id="e_tr" rows={3} {...bind("tr")} />
      <label className="lbl" htmlFor="e_f" style={{marginTop:12}}>Flashcards: question | answer</label><textarea className="input" id="e_f" rows={4} placeholder="What does a JOIN do? | Combines rows from two tables on a key" {...bind("fc")} />
      <label className="lbl" htmlFor="e_i" style={{marginTop:12}}>Interview questions: question | model answer</label><textarea className="input" id="e_i" rows={4} {...bind("i")} />
      <label className="lbl" htmlFor="e_q" style={{marginTop:12}}>Quiz: question | correct answer | wrong | wrong | wrong</label><textarea className="input" id="e_q" rows={4} placeholder="Which join keeps all left rows? | LEFT JOIN | INNER JOIN | RIGHT JOIN | CROSS JOIN" {...bind("q")} />
      {err ? <p className="formerr">{err}</p> : null}
      <div className="row" style={{marginTop:16, justifyContent:"flex-end"}}><button className="btn" onClick={() => editTopic(null)}>Cancel</button><button className="btn primary" onClick={saveIt}>Save notes</button></div>
    </section>
  );
}

function Planned({t}){
  return (
    <div className="panel empty" style={{marginTop:20}}><span style={{fontSize:"2rem"}}>{t.world.icon}</span><h2 style={{margin:"10px 0 6px"}}>This topic is empty</h2>
      <p className="muted">Write its key points, flashcards, interview questions and quiz in your own words. Writing it yourself is one of the best ways to remember it.</p>
      <div className="row" style={{justifyContent:"center", marginTop:14}}><button className="btn primary" onClick={() => editTopic(t.id)}><Icon name="edit" />Write the notes</button></div></div>
  );
}

function TabBody({t, tab}){
  const [run, setRun] = useState(0);
  const again = () => setRun(run + 1);
  const fm = topicFormats(t);
  if (tab === "notes") return <NotesTab t={t} />;
  if (tab === "cheat") return <><div style={{maxWidth:560}}><CheatCard t={t} /></div><PrintBtn className="btn noprint" /></>;
  const sess = tab === "revision" ? <CardSession items={t.cards.map((c, i) => cardItem(t, i))} after={fm.includes("quiz") ? <button className="btn primary" onClick={() => setTab("quiz")}>Take the quiz</button> : null} />
    : tab === "interview" ? <InterviewSession items={iqItems(t)} onAgain={again} back={<button className="btn" onClick={() => setTab("notes")}>Back to notes</button>} />
    : tab === "quiz" ? <QuizSession items={shuffle(t.quiz.map(q => prepQ(t, q)))} topic={t} onAgain={again} back={<button className="btn" onClick={() => setTab("revision")}>Review flashcards</button>} />
    : <ArenaSession items={shuffle(pracItems(t))} topic={t} onAgain={again} back={<button className="btn" onClick={() => setTab("notes")}>Back to notes</button>} />;
  return <div className="sess" key={run}>{sess}</div>;
}

export default function Topic({t}){
  useEffect(() => { if (S.lastTopic !== t.id) { S.lastTopic = t.id; save(); } }, [t.id]);
  const w = t.world, prev = w.topics[t.idx - 1], next = w.topics[t.idx + 1], ts = topicStats(t);
  const fm = topicFormats(t);
  const tab = fm.includes(nav.tab) ? nav.tab : fm[0] || "notes";
  const count = {revision:t.cards.length, interview:t.iq.length, quiz:t.quiz.length, practical:t.prac.length};
  return (<>
    <Crumbs parts={[{label:w.name, to:w.id}, t.t]} />
    <div className="phead" style={{marginBottom:0}}><div><h1>{t.t}</h1><p>{w.name}, level {t.idx + 1} of {w.topics.length} <span className={"lvl-tag lvl-" + (t.lvl || "B")}>{LVL[t.lvl || "B"]}</span></p></div><Pill s={ts.status} /></div>
    {t.planned ? null : <div className="modes" role="tablist" style={{"--wc":w.color}}>
      {fm.map(k => <button key={k} role="tab" className={"mode" + (tab === k ? " on" : "")} aria-selected={tab === k} onClick={() => setTab(k)}><Icon name={FMT[k].icon} /><span>{FMT[k].name}</span>{count[k] ? <small>{count[k]}</small> : null}</button>)}
    </div>}
    <div style={{"--wc":w.color}}>
      {nav.editingTopic === t.id ? <Editor t={t} /> : t.planned ? <Planned t={t} /> : <TabBody key={tab} t={t} tab={tab} />}
    </div>
    <div className="pager noprint">
      {prev ? <button className="btn" onClick={() => go(prev.id)}>Previous: {prev.t}</button> : <span />}
      {next ? <button className="btn" onClick={() => go(next.id)}>Next: {next.t}</button> : <button className="btn primary" onClick={() => startBoss(w)}><Icon name="bolt" />{w.name} boss battle</button>}
    </div>
  </>);
}
