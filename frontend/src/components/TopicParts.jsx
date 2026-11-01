/* ================= topic widgets: diagram, lesson, checkpoint, level path ================= */
import {Fragment, useState} from "react";
import {plain} from "../lib/text.js";
import {LVL} from "../lib/courses.js";
import {S, topicRec, topicStats, prepQ, gainXP, save, go} from "../lib/store.js";
import {Fmt, Code, CopyBtn, Ring, Options} from "./common.jsx";
import {Icon, Glyph} from "./icons.jsx";

/* ---------- every topic gets a diagram ---------- */
const shortPt = p => { const s = plain(p).replace(/`/g, ""); const lead = s.split(/[:.;]/)[0]; return lead.length > 46 ? lead.slice(0, 44).replace(/\s\S*$/, "") + "…" : lead; };
const autoVis = t => ({type:"map", center:t.t, nodes:t.pts.slice(0, 4).map(shortPt)});
export function Visual({t}){
  const v = t.vis || autoVis(t);
  const i = k => ({"--i":k});
  if (v.type === "flow" || v.type === "cycle") {
    return (
      <div className={"vis vflow" + (v.type === "cycle" ? " vcycle" : "")}>
        {v.steps.map((s, k) => <Fragment key={k}>
          <div className="vnode" style={i(k)}><span className="vn">{k + 1}</span><Fmt text={s} /></div>
          {k < v.steps.length - 1 ? <span className="varrow" style={i(k)} aria-hidden="true"><Glyph name="arrow" /></span> : null}
        </Fragment>)}
        {v.type === "cycle" ? <span className="vloop" style={i(v.steps.length)}><Glyph name="loop" /> repeats</span> : null}
      </div>
    );
  }
  if (v.type === "stack") return <div className="vis vstack">{v.layers.map((l, k) => <Fmt key={k} as="div" className="vlayer" style={i(k)} text={l} />)}</div>;
  if (v.type === "compare") return (
    <div className="vis vcompare" style={{"--n":v.cols.length}}>
      {v.cols.map((c, k) => <div key={k} className="vcol" style={i(k)}><Fmt as="div" className="vch" text={c.h} /><ul>{c.items.map((x, j) => <Fmt key={j} as="li" text={x} />)}</ul></div>)}
    </div>
  );
  if (v.type === "grid") return <div className="vis vgrid" style={{"--c":v.cols}}>{v.labels.map((l, k) => <Fmt key={k} as="div" className="vcell" style={i(k)} text={l} />)}</div>;
  if (v.type === "tree") return (
    <div className="vis vtree"><Fmt as="div" className="vroot" style={i(0)} text={v.root} />
      <div className="vkids">{v.kids.map((kd, k) => { const node = typeof kd === "string" ? {n:kd, k:[]} : kd; return (
        <div key={k} className="vkid" style={i(k + 1)}><Fmt as="div" className="vknode" text={node.n} />
          {(node.k || []).length ? <ul>{node.k.map((x, j) => <Fmt key={j} as="li" text={x} />)}</ul> : null}</div>); })}</div>
    </div>
  );
  return (
    <div className="vis vmap"><div className="vcenter" style={i(0)}>{v.center}</div>
      <div className="vspokes">{v.nodes.map((n, k) => <div key={k} className="vspoke" style={i(k + 1)}>{n}</div>)}</div></div>
  );
}

/* ---------- full lessons ---------- */
function LessonBlock({b}){
  if (typeof b === "string") return <Fmt as="p" text={b} />;
  if (b.sub) return <Fmt as="h3" className="lsub" text={b.sub} />;
  if (b.code != null) return (
    <div className="codewrap lcode"><div className="codehead"><span>Example</span><CopyBtn text={b.code} data="" /></div><Code code={b.code} />
      {b.out ? <div className="lout"><span>Output</span><pre>{b.out}</pre></div> : null}</div>
  );
  if (b.tip) return <div className="callout tip"><b>Tip</b><Fmt text={b.tip} /></div>;
  if (b.warn) return <div className="callout warn"><b>Watch out</b><Fmt text={b.warn} /></div>;
  if (b.list) return <ul className="llist">{b.list.map((x, k) => <Fmt key={k} as="li" text={x} />)}</ul>;
  if (b.table) return (
    <div className="tbl-wrap ltable"><table className="table">
      <thead><tr>{b.table.head.map((h, k) => <Fmt key={k} as="th" text={h} />)}</tr></thead>
      <tbody>{b.table.rows.map((r, k) => <tr key={k}>{r.map((c, j) => <Fmt key={j} as="td" text={c} />)}</tr>)}</tbody></table></div>
  );
  return null;
}
const scrollTo = id => { const s = document.getElementById(id); if (s) s.scrollIntoView({behavior:"smooth", block:"start"}); };
export function Lesson({t}){
  const secs = t.doc || [];
  const read = (S.topics[t.id] || {}).read || [];
  const markRead = i => {
    const rec = topicRec(t.id);
    rec.read = rec.read || [];
    if (rec.read.includes(i)) return;
    rec.read.push(i); gainXP(5, "section read", true); save();
    scrollTo(document.getElementById("sec-" + (i + 1)) ? "sec-" + (i + 1) : "cp");
  };
  return (<>
    <nav className="panel toc"><div className="kicker"><Icon name="notes" />In this lesson, {secs.length} sections</div>
      <ol>{secs.map((s, i) => <li key={i}><button className="link" onClick={() => scrollTo("sec-" + i)}>{s.h}</button>{read.includes(i) ? <> <span className="okmark" title="Read"><Glyph name="check" /></span></> : null}</li>)}</ol></nav>
    {secs.map((s, i) => (
      <section key={i} className="panel lesson" id={"sec-" + i}><h2><span className="secnum">{i + 1}</span>{s.h}</h2>
        {s.b.map((b, k) => <LessonBlock key={k} b={b} />)}
        <div className="lfoot"><button className={"btn sm" + (read.includes(i) ? "" : " primary")} onClick={() => markRead(i)}>{read.includes(i) ? <>Read <Glyph name="check" /></> : "Mark section as read, +5 XP"}</button></div>
      </section>
    ))}
  </>);
}

/* ---------- checkpoint (gamified notes) ---------- */
export function Checkpoint({t}){
  const pick = () => prepQ(t, t.quiz[Math.floor(Math.random() * t.quiz.length)]);
  const [q, setQ] = useState(() => t.quiz.length ? pick() : null);
  const [picked, setPicked] = useState(null);
  const [cleared, setCleared] = useState(false);
  if (!q) return null;
  const rec = S.topics[t.id] || {};
  const answer = k => {
    setPicked(k);
    if (k === q.ans && !rec.learned) { topicRec(t.id).learned = true; setCleared(true); gainXP(25, "level cleared"); }
  };
  const again = () => { setQ(pick()); setPicked(null); setCleared(false); };
  const ok = picked === q.ans, next = t.world.topics[t.idx + 1];
  return (
    <section className="panel section checkpoint" id="cp">
      <div className="shead"><h2><Icon name="bolt" />Checkpoint</h2>{rec.learned ? <span className="pill strong">Level cleared</span> : <span className="muted small">Answer correctly to clear this level, +25 XP</span>}</div>
      <div>
        <Fmt as="p" className="qq" style={{margin:".2em 0 .8em"}} text={q.q} />
        <Options q={q} picked={picked} onPick={answer} />
        {picked == null ? null : <div className="explain">
          {cleared ? <><p><strong style={{color:"var(--good)"}}>Level cleared!</strong> <Fmt text={q.exp} /> Its flashcards are now in your daily review.</p>
              {next ? <button className="btn primary" onClick={() => go(next.id)}>Next level: {next.t}</button> : null}</>
            : ok ? <><p><strong style={{color:"var(--good)"}}>Correct.</strong> <Fmt text={q.exp} /></p><button className="btn" onClick={again}>Another question</button></>
            : <><p><strong style={{color:"var(--bad)"}}>Not quite.</strong> <Fmt text={q.exp} /> Reread the key points, then try again.</p><button className="btn primary" onClick={again}>Try again</button></>}
        </div>}
      </div>
    </section>
  );
}

/* ---------- topics grouped by level ---------- */
export function LevelPath({w, onPick, badge}){
  const groups = ["B", "I", "A"].map(l => ({l, ts:w.topics.filter(t => (t.lvl || "B") === l)})).filter(g => g.ts.length);
  return groups.map(g => (
    <div key={g.l} className="lvl-group"><div className="lvl-h"><span className={"lvl-tag lvl-" + g.l}>{LVL[g.l]}</span><span className="muted small">{g.ts.length} topic{g.ts.length > 1 ? "s" : ""}</span></div>
      <div className="lvl-list">{g.ts.map(t => { const s = topicStats(t); return (
        <button key={t.id} className="lnode panel" style={{"--wc":w.color}} onClick={() => onPick(t)}>
          <Ring p={s.mastery} small>{t.idx + 1}</Ring>
          <span className="grow"><span className="lt">{t.t}</span>{t.planned ? <span className="ls">Not written yet</span> : <Fmt className="ls" text={t.hook} />}</span>{badge(t, s)}
        </button>); })}</div>
    </div>
  ));
}
