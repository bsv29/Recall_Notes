/* ================= dashboard ================= */
import {tday, dayLabel} from "../lib/text.js";
import {FORMATS} from "../lib/courses.js";
import {S, ME, ALL, WORLDS, reviewQueue, reviewedToday, learnedCount, cardR, topicStats, worldStats, level, lvlStart, lvlEnd, rank, currentStreak, go} from "../lib/store.js";
import {Fmt, Pill, Ring, Bar, Dot} from "../components/common.jsx";
import {Icon} from "../components/icons.jsx";

function Heatmap(){
  const d = tday(), dow = new Date().getDay(), weeks = 16;
  const start = d - ((weeks - 1) * 7 + dow);
  return (
    <div className="heat" aria-label="Review activity, last 16 weeks">
      {Array.from({length:weeks * 7}, (_, k) => {
        const day = start + k, n = S.days[day] || 0;
        const lv = day > d ? "fut" : n === 0 ? "" : n < 6 ? "l1" : n < 16 ? "l2" : n < 31 ? "l3" : "l4";
        return <i key={k} className={lv} title={`${dayLabel(day)}: ${n} cards`} />;
      })}
    </div>
  );
}

export default function Dashboard(){
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const first = ME.name ? ", " + ME.name.split(" ")[0] : "";
  const due = reviewQueue(), done = reviewedToday(), goal = S.prefs.goal;
  const pct = Math.min(100, Math.round(done / goal * 100));
  const awayDays = S.last != null ? tday() - S.last : 0;
  const fadingCards = Object.values(S.cards).filter(c => cardR(c) < 0.8).length;
  const fading = ALL.map(t => ({t, s:topicStats(t)})).filter(x => x.s.ret != null).sort((a, b) => a.s.ret - b.s.ret).slice(0, 5);
  const nextUp = ALL.filter(t => !t.world.custom && S.focus.includes(t.world.id) && !(S.topics[t.id] && S.topics[t.id].learned)).slice(0, 4);
  const hpool = ALL.filter(t => t.hook); const hk = hpool[tday() % hpool.length];
  const l = level(S.xp), a = lvlStart(l), b = lvlEnd(l);
  const catchup = () => go("review", {mode:"catchup"});
  return (<>
    <div className="phead"><div><h1>{greet}{first}</h1>
        <p>{new Date().toLocaleDateString(undefined, {weekday:"long", month:"long", day:"numeric"})}. {due.length ? `${due.length} card${due.length > 1 ? "s" : ""} waiting for you.` : learnedCount() ? "You’re all caught up." : "Start with your first topic below."}</p></div>
      <div className="row">{due.length ? <button className="btn primary" onClick={() => go("review")}><Icon name="review" />Start review</button> : null}<button className="btn" onClick={() => go("library")}><Icon name="grid" />All courses</button></div></div>
    {awayDays >= 7 && fadingCards ? <div className="banner"><div><h3>Welcome back. It’s been {awayDays} days.</h3><p className="muted" style={{margin:0}}>{fadingCards} card{fadingCards > 1 ? "s have" : " has"} faded below 80% recall. A short catch-up, weakest cards first, restores most of it.</p></div><button className="btn primary" onClick={catchup}>Start catch-up</button></div> : null}
    <div className="modestrip">{FORMATS.map(f => <button key={f.id} className="mstrip" onClick={() => go(f.id)}><Icon name={f.icon} /><span><b>{f.name}</b><small>{f.desc}</small></span></button>)}</div>
    <div className="grid g3">
      <section className="panel pad"><div className="kicker"><Icon name="review" />Today</div>
        <div className="today"><Ring p={pct}>{done}<br /><small className="muted">of {goal}</small></Ring>
          <div><div className="big">{due.length}</div><div className="muted small">cards due now</div>
            <button className="link" style={{marginTop:8}} onClick={() => go(due.length ? "review" : (nextUp[0] ? nextUp[0].id : "library"))}>{due.length ? "Review now" : "Learn something new"}</button></div></div></section>
      <section className="panel pad"><div className="kicker"><Icon name="fire" />Streak</div>
        <div className="row" style={{alignItems:"baseline", gap:8}}><span className="big">{currentStreak()}</span><span className="muted">days, best {S.best || currentStreak()}</span></div><Heatmap /></section>
      <section className="panel pad"><div className="kicker"><Icon name="bolt" />Level {l}</div>
        <div className="big" style={{fontSize:"1.6rem"}}>{rank(l)}</div>
        <Bar pct={(S.xp - a) / (b - a) * 100} style={{margin:"12px 0 6px"}} />
        <div className="muted small">{S.xp - a} of {b - a} XP to level {l + 1}</div>
        <button className="link" style={{marginTop:8}} onClick={() => go("progress")}>See badges</button></section>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <section className="panel pad"><div className="shead"><h2>Memory health</h2><span className="muted small">Estimated recall today</span></div>
        <div className="health">{WORLDS.filter(w => w.topics.length).map(w => { const s = worldStats(w); const r = s.ret == null ? null : Math.round(s.ret * 100);
          return <div key={w.id} className="hrow" style={{"--wc":w.color}}><span className="nm"><Dot />{w.name}</span><Bar pct={r || 0} /><span className="v">{r == null ? "–" : r + "%"}</span></div>; })}</div>
        <p className="muted small" style={{margin:"14px 0 0"}}>Recall drops between reviews. Each correct answer makes the next drop slower, so cards come back after 1, 3, 7, 16, 35, 75 and finally 150 days.</p></section>
      <section className="panel pad"><div className="shead"><h2>Fading soon</h2>{fading.length ? <button className="link" onClick={catchup}>Refresh all</button> : null}</div>
        {fading.length ? <div className="list">{fading.map(x => (
          <button key={x.t.id} className="li" style={{"--wc":x.t.world.color}} onClick={() => go(x.t.id, {tab:"revision"})}><Dot /><span className="grow"><span className="lt">{x.t.t}</span><br /><span className="ls">{x.t.world.name}</span></span><Pill s={x.s.status} /><b>{Math.round(x.s.ret * 100)}%</b></button>
        ))}</div> : <p className="muted">Nothing yet. Topics appear here once you’ve reviewed their flashcards, sorted by how close they are to being forgotten.</p>}</section>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <section className="panel pad"><div className="shead"><h2>Up next</h2><button className="link" onClick={() => go("library")}>Open library</button></div>
        {nextUp.length ? <div className="list">{nextUp.map(t => (
          <button key={t.id} className="li" style={{"--wc":t.world.color}} onClick={() => go(t.id)}><Dot /><span className="grow"><span className="lt">{t.t}</span><br /><span className="ls">{t.world.name}, topic {t.idx + 1}</span></span></button>
        ))}</div> : <p className="muted">You’ve learned every topic in your focus areas. Try a boss battle, or pick another course.</p>}</section>
      <section className="panel hook-day" style={{"--wc":hk.world.color}}><div className="kicker">Hook of the day, {hk.world.name}</div><Fmt as="p" className="hk" text={hk.hook} /><button className="link" onClick={() => go(hk.id)}>Open {hk.t}</button></section>
    </div>
  </>);
}
