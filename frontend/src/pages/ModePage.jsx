/* ================= mode pages: Notes, Cheat sheet, Revision, Interview, Quiz, Practical ================= */
import {useState} from "react";
import {shuffle} from "../lib/text.js";
import {FMT, topicFormats} from "../lib/courses.js";
import {S, WORLDS, BYID, cardItem, iqItems, pracItems, prepQ, reviewQueue, go, setModeCourse, startBoss, save} from "../lib/store.js";
import {Crumbs, Bar, StarsSm, PrintBtn, CheatCard} from "../components/common.jsx";
import {LevelPath} from "../components/TopicParts.jsx";
import {CourseSearch, CourseGrid} from "./Library.jsx";
import {Icon} from "../components/icons.jsx";
import CardSession from "../components/sessions/CardSession.jsx";
import QuizSession from "../components/sessions/QuizSession.jsx";
import ArenaSession from "../components/sessions/ArenaSession.jsx";
import InterviewSession from "../components/sessions/InterviewSession.jsx";

const usableFor = (w, mode) => w.formats.includes(mode) && w.topics.some(t => !t.planned && topicFormats(t).includes(mode));

function CoursePicker({mode}){
  const [query, setQuery] = useState("");
  const f = FMT[mode];
  const q = query.trim().toLowerCase();
  const list = WORLDS.filter(w => usableFor(w, mode)).filter(w => !q || w.name.toLowerCase().includes(q) || w.blurb.toLowerCase().includes(q));
  return (<>
    <div className="phead"><div><div className="kicker"><Icon name={f.icon} />{f.name}</div><h1>Pick a course</h1><p>{f.desc}. Choose the course you want to study.</p></div></div>
    <CourseSearch value={query} onChange={setQuery} />
    <CourseGrid list={list} onPick={w => setModeCourse(mode, w.id)} />
    {list.length ? null : <div className="panel empty"><p className="muted">No course matches “{query}”.</p></div>}
  </>);
}

function ModeHead({mode, w, extra}){
  const f = FMT[mode];
  return (
    <div className="phead"><div><div className="kicker"><Icon name={f.icon} />{f.name}</div><h1>{w.icon} {w.name}</h1><p>{w.blurb}</p></div>
      <div className="row">{extra}<button className="btn" onClick={() => setModeCourse(mode, null)}><Icon name="grid" />Change course</button></div></div>
  );
}

export default function ModePage({mode}){
  const [sess, setSess] = useState(null);
  const w = WORLDS.find(x => x.id === (S.modeCourse || {})[mode]);
  if (!w || !usableFor(w, mode)) return <CoursePicker mode={mode} />;
  const ready = w.topics.filter(t => !t.planned && topicFormats(t).includes(mode));
  const back = () => { setSess(null); window.scrollTo(0, 0); };

  if (mode === "notes") {
    const done = ready.filter(t => S.topics[t.id] && S.topics[t.id].learned).length;
    return (<>
      <ModeHead mode={mode} w={w} />
      <div className="quest panel"><div><b>{done} of {ready.length} levels cleared</b><Bar pct={ready.length ? done / ready.length * 100 : 0} style={{marginTop:8, "--wc":w.color}} /></div><span className="muted small">Read a topic, then pass its checkpoint to clear the level and earn XP.</span></div>
      <LevelPath w={w} onPick={t => go(t.id, {tab:"notes"})} badge={(t, s) => s.learned ? <span className="pill strong">Cleared</span> : t.planned ? <span className="pill">Empty</span> : <span className="pill new">Start</span>} />
    </>);
  }
  if (mode === "cheat") return (<>
    <ModeHead mode={mode} w={w} extra={<PrintBtn />} />
    <div className="sheet">{ready.map(t => <CheatCard key={t.id} t={t} />)}</div>
  </>);

  const per = {revision:t => t.cards.length + " cards", interview:t => t.iq.length + " questions", quiz:t => t.quiz.length + " questions", practical:t => t.prac.length + " challenges"}[mode];
  const total = ready.reduce((a, t) => a + ({revision:t.cards, interview:t.iq, quiz:t.quiz, practical:t.prac}[mode]).length, 0);
  const label = {revision:"Study every card", interview:"Start a mock interview", quiz:"Mixed quiz", practical:"Arena run"}[mode];
  const sub = {revision:`${total} flashcards from ${w.name}. Your ratings schedule each card’s next review.`, interview:"10 random questions. Answer as you would out loud, then compare with the model answer.", quiz:"Up to 15 questions from every topic, with combo multipliers.", practical:"8 timed challenges from the whole course. 3 lives, combos and stars."}[mode];
  const start = () => { setSess((sess || 0) + 1); window.scrollTo(0, 0); };

  if (sess) {
    const again = start, backBtn = <button className="btn" onClick={back}>Back to {w.name}</button>;
    const body = mode === "revision" ? <CardSession items={shuffle(ready.flatMap(t => t.cards.map((c, i) => cardItem(t, i))))} showTopic after={<button className="btn primary" onClick={back}>Done</button>} />
      : mode === "interview" ? <InterviewSession items={ready.flatMap(iqItems)} max={10} onAgain={again} back={backBtn} />
      : mode === "quiz" ? <QuizSession items={shuffle(ready.flatMap(t => t.quiz.map(q => prepQ(t, q)))).slice(0, 15)} onAgain={again} back={backBtn} />
      : <ArenaSession items={shuffle(ready.flatMap(pracItems))} max={8} onAgain={again} back={backBtn} />;
    return (<>
      <Crumbs parts={[{label:FMT[mode].name, onClick:back}, w.name]} />
      <div className="phead"><div><h1>{label}: {w.name}</h1><p>{sub}</p></div><button className="btn" onClick={back}>Back to {w.name}</button></div>
      <div className="sess" key={sess}>{body}</div>
    </>);
  }

  const due = mode === "revision" ? reviewQueue().length : 0;
  const pickTopic = t => { if (t.planned || !topicFormats(t).includes(mode)) return go(t.id); go(t.id, {tab:mode}); };
  return (<>
    <ModeHead mode={mode} w={w} />
    {mode === "revision" ? <div className="banner"><div><h3>Daily review: {due} card{due === 1 ? "" : "s"} due</h3><p className="muted" style={{margin:0}}>Cards due today from every course, spaced so they come back just before you’d forget.</p></div><button className="btn primary" disabled={!due} onClick={() => go("review")}>Start daily review</button></div> : null}
    <div className="hero-mode panel" style={{"--wc":w.color}}><div><h2>{label}</h2><p className="muted" style={{margin:".3em 0 0"}}>{sub}</p></div>
      <div className="row"><button className="btn primary lg" onClick={start}><Icon name={FMT[mode].icon} />Start</button>
        {mode === "quiz" && total >= 4 ? <button className="btn lg" onClick={() => startBoss(w)}><Icon name="bolt" />Boss battle</button> : null}</div></div>
    <h2 className="cat-h">Or pick a topic</h2>
    <LevelPath w={w} onPick={pickTopic} badge={(t, s) => t.planned || !topicFormats(t).includes(mode) ? <span className="pill">—</span>
      : <><span className="muted small">{per(t)}</span>{mode === "practical" ? <StarsSm n={(S.topics[t.id] || {}).stars} /> : mode === "quiz" && (S.topics[t.id] || {}).quiz != null ? <span className="pill">{S.topics[t.id].quiz}%</span> : null}</>} />
  </>);
}
