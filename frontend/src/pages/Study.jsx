/* ================= review, boss battle, cheat sheets, progress ================= */
import {useState} from "react";
import {shuffle} from "../lib/text.js";
import {S, ALL, WORLDS, nav, ui, reviewQueue, learnedCount, newLeftToday, topicStats, prepQ, level, lvlStart, lvlEnd, rank, currentStreak, BADGES, go, notify} from "../lib/store.js";
import {Crumbs, Pill, Meter, Tag, Bar, PrintBtn, CheatCard} from "../components/common.jsx";
import {Glyph} from "../components/icons.jsx";
import CardSession from "../components/sessions/CardSession.jsx";
import QuizSession from "../components/sessions/QuizSession.jsx";

export function Review(){
  const catchup = nav.reviewMode === "catchup";
  const [q] = useState(() => reviewQueue(nav.reviewMode));
  return (<>
    <div className="phead"><div><h1>{catchup ? "Catch-up review" : "Daily review"}</h1>
        <p>{catchup ? "Your weakest cards first, the ones closest to being forgotten." : `Due cards from every library, plus up to ${S.prefs.newLimit} new cards a day from topics you’ve learned.`} Rate honestly: the schedule only works if “Good” means you really remembered.</p></div>
      {catchup ? <button className="btn" onClick={() => go("review")}>Switch to daily review</button> : null}</div>
    <div className="sess">
      {q.length ? <CardSession items={q} showTopic after={<button className="btn primary" onClick={() => go("dashboard")}>Back to dashboard</button>} />
        : <div className="panel empty"><span className="empty-ic" style={{fontSize:"2rem", color:"var(--acc)"}}><Glyph name="party" /></span><h2 style={{margin:"10px 0 6px"}}>All caught up</h2>
            <p className="muted">{learnedCount() ? (newLeftToday() ? "No cards are due. Learn another topic to add new cards, or try a boss battle." : "You’ve hit today’s new-card limit. Come back tomorrow, or raise the limit in Settings.") : "Learn a topic first. Its flashcards join this queue automatically."}</p>
            <button className="btn primary" onClick={() => go("library")}>Open library</button></div>}
    </div>
  </>);
}

function BossRun({w, onAgain}){
  const [pool] = useState(() => { const p = []; w.topics.forEach(t => (t.quiz || []).forEach(q => p.push(prepQ(t, q)))); return shuffle(p).slice(0, 8); });
  return <QuizSession items={pool} boss world={w} onAgain={onAgain} back={<button className="btn" onClick={() => go(w.id)}>Back to {w.name}</button>} />;
}
export function Boss({w}){
  const [run, setRun] = useState(0);
  const n = Math.min(8, w.topics.reduce((a, t) => a + (t.quiz || []).length, 0));
  return (<>
    <Crumbs parts={[{label:w.name, to:w.id}, "Boss battle"]} />
    <div className="phead"><div><h1>{w.icon} {w.name} boss battle</h1><p>{n} mixed questions from every {w.name} topic. Three lives; each wrong answer costs one. Win for +100 XP.</p></div></div>
    <div className="sess"><BossRun key={run} w={w} onAgain={() => setRun(run + 1)} /></div>
  </>);
}

const CSW = () => WORLDS.filter(w => w.formats.includes("cheat") && w.topics.some(t => !t.planned));
export function Cheats(){
  const w = CSW().find(x => x.id === ui.csWorld) || CSW()[0];
  const list = w.topics.filter(t => !t.planned && t.pts.length && (!ui.csLearnedOnly || (S.topics[t.id] && S.topics[t.id].learned)));
  return (<>
    <div className="phead"><div><h1>Cheat sheets</h1><p>Every hook, key point and trap on one page. Skim it before an interview, or print it.</p></div>
      <div className="row noprint"><label className="switch"><input type="checkbox" checked={ui.csLearnedOnly} onChange={e => { ui.csLearnedOnly = e.target.checked; notify(); }} />Only learned topics</label><PrintBtn /></div></div>
    <div className="seg noprint" style={{marginBottom:20}} role="tablist">{CSW().map(x => <button key={x.id} className={x.id === w.id ? "on" : ""} onClick={() => { ui.csWorld = x.id; notify(); }}>{x.name}</button>)}</div>
    {list.length ? <div className="sheet">{list.map(t => <CheatCard key={t.id} t={t} />)}</div>
      : <div className="panel empty"><p className="muted">{w.topics.length ? "No learned topics here yet. Turn off the filter to see the full sheet." : "No notes in this section yet."}</p></div>}
  </>);
}

export function Progress(){
  const l = level(S.xp), a = lvlStart(l), b = lvlEnd(l);
  const longTerm = Object.values(S.cards).filter(c => c.box >= 5).length;
  const rows = ALL.map(t => ({t, s:topicStats(t)})).filter(x => x.s.learned || x.s.seen).sort((x, y) => (x.s.ret == null ? 2 : x.s.ret) - (y.s.ret == null ? 2 : y.s.ret));
  const stats = [[S.xp, "total XP"], [currentStreak(), "day streak"], [S.best || 0, "best streak"], [learnedCount(), "topics learned"], [S.reviews, "cards reviewed"], [longTerm, "cards in long-term memory"]];
  return (<>
    <div className="phead"><div><h1>Progress</h1><p>Level {l}, {rank(l)}. {S.xp - a} of {b - a} XP to the next level.</p></div></div>
    <div className="panel pad" style={{marginBottom:16}}><Bar pct={(S.xp - a) / (b - a) * 100} style={{height:10}} /></div>
    <div className="grid g3" style={{gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))"}}>
      {stats.map(x => <div key={x[1]} className="panel pad"><div className="big" style={{fontSize:"1.8rem"}}>{x[0]}</div><div className="muted small">{x[1]}</div></div>)}
    </div>
    <h2 style={{margin:"28px 0 12px"}}>Badges</h2>
    <div className="badges">{BADGES.map(bd => <div key={bd.id} className={"badge" + (S.badges.includes(bd.id) ? " on" : "")}><span className="bi"><Glyph name={bd.icon} /></span><div><b>{bd.name}</b><small>{bd.how}</small></div></div>)}</div>
    <h2 style={{margin:"28px 0 12px"}}>Topic memory</h2>
    {rows.length ? <div className="panel tbl-wrap"><table className="table"><thead><tr><th>Topic</th><th>Library</th><th>Status</th><th>Strength</th><th>Recall today</th></tr></thead><tbody>
      {rows.map(x => <tr key={x.t.id} onClick={() => go(x.t.id)}><td className="tt">{x.t.t}</td><td><Tag color={x.t.world.color}>{x.t.world.name}</Tag></td><td><Pill s={x.s.status} /></td><td><Meter avg={x.s.avgBox} color={x.t.world.color} /></td><td><b>{x.s.ret == null ? "–" : Math.round(x.s.ret * 100) + "%"}</b></td></tr>)}
    </tbody></table></div> : <div className="panel empty"><p className="muted">Learn a topic and review its cards to see your memory here.</p></div>}
  </>);
}
