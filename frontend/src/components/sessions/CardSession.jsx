/* ================= flashcard session ================= */
import {useState} from "react";
import {S, IV, MAXBOX, applyGrade, useKeyHandler} from "../../lib/store.js";
import {Fmt, Tag} from "../common.jsx";

const GRADES = ["again", "hard", "good", "easy"];
const iv = n => { const d = IV[Math.min(MAXBOX, n)]; return d >= 30 ? Math.round(d / 30) + " mo" : d + "d"; };

export default function CardSession({items, showTopic, after}){
  const [queue, setQueue] = useState(() => items.slice());
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const finished = i >= queue.length;

  const grade = g => {
    if (!flipped || finished) return;
    const c = queue[i];
    applyGrade(c.id, g); setDone(done + 1);
    if (g === "again" && !c.requeued) setQueue(queue.concat(Object.assign({}, c, {requeued:true})));
    setI(i + 1); setFlipped(false);
  };
  useKeyHandler(e => {
    if (finished) return;
    if (e.key === " ") { if (e.target.tagName === "BUTTON") return; e.preventDefault(); setFlipped(f => !f); }
    else if (flipped && e.key.length === 1 && "1234".includes(e.key)) grade(GRADES[+e.key - 1]);
  });

  if (finished) return (
    <div className="panel result"><div className="big">{done}</div><h2 style={{margin:"8px 0 6px"}}>Deck cleared</h2>
      <p className="muted">Each card is now scheduled to come back right before you’d forget it.</p>
      <div className="row" style={{justifyContent:"center"}}>{after}</div></div>
  );
  const c = queue[i], st = S.cards[c.id], b = st ? st.box : 0;
  return (<>
    <div className="sbar"><span>Card {Math.min(i + 1, queue.length)} of {queue.length}</span>{showTopic ? <Tag color={c.color}>{c.topic}</Tag> : null}<span>{st ? "Strength " + st.box + " of " + MAXBOX : "New card"}</span></div>
    <div className="prog"><span style={{width:i / queue.length * 100 + "%"}} /></div>
    <div className={"fc" + (flipped ? " flipped" : "")} style={{"--wc":c.color}} tabIndex={0} role="button" aria-label="Flashcard. Press Space to flip." onClick={() => setFlipped(!flipped)}>
      <div className="face front" aria-hidden={flipped}><span className="side-l">Question</span><Fmt as="p" text={c.q} /><span className="tap">Tap or press <kbd>Space</kbd></span></div>
      <div className="face back" aria-hidden={!flipped}><span className="side-l">Answer</span><Fmt as="p" text={c.a} /></div>
    </div>
    <div className={"grades" + (flipped ? "" : " off")} aria-label="How well did you remember?">
      <button className="g again" onClick={() => grade("again")}><b>Again</b><small>today <kbd>1</kbd></small></button>
      <button className="g hard" onClick={() => grade("hard")}><b>Hard</b><small>{iv(Math.max(1, b)) === "0d" ? "1d" : Math.max(1, Math.round(IV[Math.max(1, b)] / 2)) + "d"} <kbd>2</kbd></small></button>
      <button className="g good" onClick={() => grade("good")}><b>Good</b><small>{iv(b + 1)} <kbd>3</kbd></small></button>
      <button className="g easy" onClick={() => grade("easy")}><b>Easy</b><small>{iv(b + 2)} <kbd>4</kbd></small></button>
    </div>
  </>);
}
