/* ================= mock interview ================= */
import {useEffect, useState} from "react";
import {shuffle} from "../../lib/text.js";
import {S, topicRec, gainXP, useKeyHandler} from "../../lib/store.js";
import {Fmt, Tag} from "../common.jsx";
import {Icon} from "../icons.jsx";

export default function InterviewSession({items:given, max, onAgain, back}){
  const [items] = useState(() => shuffle(given).slice(0, max || 8));
  const [i, setI] = useState(0);
  const [nailed, setNailed] = useState(0);
  const [partly, setPartly] = useState(0);
  const [xp, setXp] = useState(0);
  const [shown, setShown] = useState(false);
  const [answer, setAnswer] = useState("");
  const [secs, setSecs] = useState(0);
  const finished = i >= items.length;

  useEffect(() => {
    if (finished || shown) return;
    const t0 = Date.now(); setSecs(0);
    const id = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(id);
  }, [i, shown, finished]);

  const rate = r => {
    const g = [2, 5, 10][r]; setXp(xp + g);
    if (r === 2) { setNailed(nailed + 1); S.nailed = (S.nailed || 0) + 1; } else if (r === 1) setPartly(partly + 1);
    const tid = items[i].tid; if (tid) { const rec = topicRec(tid); rec.iv = (rec.iv || 0) + (r === 2 ? 1 : 0); }
    gainXP(g, r === 2 ? "nailed it" : "answer reviewed", r !== 2);
    setI(i + 1); setShown(false); setAnswer("");
  };
  useKeyHandler(e => { if (!finished && shown && e.key.length === 1 && "123".includes(e.key)) rate(+e.key - 1); });

  if (!items.length) return <div className="panel empty"><p className="muted">No interview questions here yet.</p></div>;
  if (finished) {
    const conf = Math.round((nailed + partly * .5) / items.length * 100);
    return (
      <div className="panel result"><div className="big">{conf}%</div><h2 style={{margin:"8px 0 6px"}}>Interview confidence</h2>
        <p className="muted">{nailed} nailed, {partly} partly, {items.length - nailed - partly} missed. +{xp} XP</p>
        <div className="row" style={{justifyContent:"center"}}><button className="btn primary" onClick={onAgain}>Another round</button>{back}</div></div>
    );
  }
  const q = items[i];
  return (<>
    <div className="sbar"><span>Question {i + 1} of {items.length}</span><Tag color={q.color}>{q.topic}</Tag>
      <span className={"clock" + (secs > 90 ? " long" : "")}>{Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0")}</span></div>
    <div className="prog"><span style={{width:i / items.length * 100 + "%"}} /></div>
    <div className="panel qcard interview" style={{"--wc":q.color}}>
      <div className="iv-who"><Icon name="mic" />Interviewer</div><Fmt as="h2" className="qq" text={q.q} />
      <label className="lbl" htmlFor="myans">Your answer</label>
      <textarea key={i} className="input" id="myans" rows={4} autoFocus value={answer} onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setShown(true); } }}
        placeholder="Answer as you would out loud. Aim for 2–4 sentences with one example." />
      {shown ? <div>
        <div className="model"><div className="kicker">Model answer</div><Fmt as="p" text={q.a} /></div>
        <p className="muted small" style={{margin:"12px 0 8px"}}>How close were you?</p>
        <div className="grades">
          <button className="g again" onClick={() => rate(0)}><b>Missed it</b><small>+2 XP</small></button>
          <button className="g hard" onClick={() => rate(1)}><b>Partly</b><small>+5 XP</small></button>
          <button className="g good" style={{gridColumn:"span 2"}} onClick={() => rate(2)}><b>Nailed it</b><small>+10 XP</small></button>
        </div>
      </div> : <div className="row" style={{marginTop:12}}><button className="btn primary" onClick={() => setShown(true)}>Show model answer</button><span className="muted small">or press <kbd>Ctrl</kbd>+<kbd>Enter</kbd></span></div>}
    </div>
  </>);
}
