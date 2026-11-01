/* ================= quiz & boss ================= */
import {useEffect, useRef, useState} from "react";
import {S, topicRec, gainXP, save, checkBadges, useKeyHandler} from "../../lib/store.js";
import {Fmt, Tag, Hearts, Options} from "../common.jsx";

/* opts: {boss, world, topic}; back: secondary button on the results screen */
export default function QuizSession({items:given, boss, world, topic, onAgain, back}){
  const [items] = useState(given);
  const [i, setI] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(boss ? 3 : 0);
  const [picked, setPicked] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [result, setResult] = useState(null);
  const nextBtn = useRef(null);
  useEffect(() => { if (picked != null && nextBtn.current) nextBtn.current.focus(); }, [picked]);

  const q = items[i];
  const answer = k => {
    if (picked != null || result) return;
    setPicked(k);
    if (k === q.ans) { const c = combo + 1; setCombo(c); setScore(score + 1); const g = 10 * Math.min(c, 3); setXpEarned(xpEarned + g); gainXP(g, c > 1 ? "combo ×" + Math.min(c, 3) : "correct"); }
    else { setCombo(0); if (boss) setHearts(hearts - 1); }
  };
  const last = i + 1 >= items.length || (boss && hearts <= 0);
  const finish = () => {
    const pct = Math.round(score / items.length * 100);
    let title, msg;
    if (boss) {
      const won = hearts > 0;
      title = won ? "Boss defeated" : "Out of lives";
      msg = won ? `${score} of ${items.length} correct with ${hearts} ${hearts === 1 ? "life" : "lives"} to spare.` : `${score} correct before your lives ran out. Revisit the topics you missed, then try again.`;
      if (won) { S.bosses[world.id] = true; gainXP(100, "boss defeated"); }
    } else if (!topic) {
      title = pct === 100 ? "Perfect run" : pct >= 50 ? "Nice work" : "Keep practising";
      msg = `${pct}% correct across ${new Set(items.map(x => x.topic)).size} topics.`;
      if (pct === 100 && items.length >= 5) gainXP(30, "perfect run");
    } else {
      const rec = topicRec(topic.id);
      rec.quiz = Math.max(rec.quiz || 0, pct);
      if (pct === 100) { S.flawless = true; gainXP(30, "perfect quiz"); }
      title = pct === 100 ? "Perfect run" : pct >= 50 ? "Nice work" : "Keep practising";
      msg = `Your best score on this topic is ${rec.quiz}%.`;
      save(); checkBadges();
    }
    setResult({title, msg});
  };
  const next = () => { if (last) finish(); else { setI(i + 1); setPicked(null); } };

  useKeyHandler(e => {
    if (result || picked != null || e.key.length !== 1) return;
    const k = "abcd1234".indexOf(e.key.toLowerCase());
    if (k >= 0 && k % 4 < q.opts.length) answer(k % 4);
  });

  if (result) return (
    <div className="panel result"><div className="big">{score}/{items.length}</div><h2 style={{margin:"8px 0 6px"}}>{result.title}</h2>
      <p className="muted">{result.msg}<br />+{xpEarned} XP from answers</p>
      <div className="row" style={{justifyContent:"center"}}><button className="btn primary" onClick={onAgain}>Try again</button>{back}</div></div>
  );
  const ok = picked === q.ans;
  return (<>
    <div className="sbar"><span>Question {i + 1} of {items.length}</span>{boss ? <Hearts n={hearts} /> : null}<span className={"combo" + (combo > 1 ? " hot" : "")}>Combo ×{Math.max(1, Math.min(combo, 3))}</span></div>
    <div className="prog"><span style={{width:i / items.length * 100 + "%"}} /></div>
    <div className="panel qcard" style={{"--wc":q.color}}>
      {boss || !topic ? <Tag color={q.color}>{q.topic}</Tag> : null}
      <Fmt as="h2" className="qq" text={q.q} />
      <Options q={q} picked={picked} onPick={answer} />
      {picked == null ? null : <div className="explain">
        <p><strong style={{color:`var(${ok ? "--good" : "--bad"})`}}>{ok ? "Correct." : "Not quite."}</strong> <Fmt text={q.exp} /></p>
        <button className="btn primary" ref={nextBtn} onClick={next}>{last ? "See results" : "Next question"}</button>
      </div>}
    </div>
  </>);
}
