/* ================= practical arena ================= */
import {useEffect, useRef, useState} from "react";
import {shuffle} from "../../lib/text.js";
import {S, topicRec, gainXP, save, checkBadges, useKeyHandler} from "../../lib/store.js";
import {Fmt, Code, HlLine, Tag, Hearts} from "../common.jsx";
import {Icon, Glyph} from "../icons.jsx";

const normAns = s => String(s).trim().replace(/[“”"]/g, "'").replace(/\s+/g, "").replace(/;$/, "").toLowerCase();
const PTYPE = {predict:"Predict the output", blank:"Fill in the blank", bug:"Find the bug", order:"Put the lines in order"};
const limit = c => c.type === "order" ? 90 : c.type === "bug" ? 60 : 75;
function makeOrder(c){
  const order = shuffle(c.lines.map((l, k) => k));
  if (order.every((v, k) => v === k) && order.length > 1) order.reverse();
  return order;
}

export default function ArenaSession({items:given, max, topic, onAgain, back}){
  const [items] = useState(() => given.slice(0, max || 8));
  const [orders] = useState(() => items.map(c => c.type === "order" ? makeOrder(c) : null));
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [picked, setPicked] = useState([]);
  const [ans, setAns] = useState("");
  const [rem, setRem] = useState(0);
  const [result, setResult] = useState(null);
  const startT = useRef(0), judgeRef = useRef(null), nextBtn = useRef(null);
  const c = items[i];

  const judge = (ok, wrong, timeout) => {
    if (verdict || result) return;
    const secs = (Date.now() - startT.current) / 1000;
    let gain = 0;
    if (ok) {
      const cb = combo + 1;
      setCombo(cb); setCorrect(correct + 1);
      const speed = Math.max(0, Math.round(10 * (1 - secs / limit(c))));
      gain = Math.max(5, (15 + speed - (hintUsed ? 5 : 0)) * Math.min(cb, 3));
      setXp(xp + gain); gainXP(gain, cb > 1 ? "combo ×" + Math.min(cb, 3) : "solved");
    } else { setCombo(0); setHearts(hearts - 1); }
    setVerdict({ok, wrong, timeout, secs});
  };
  judgeRef.current = judge;

  /* countdown for the current challenge */
  useEffect(() => {
    if (!c || verdict || result) return;
    const left = limit(c);
    startT.current = Date.now(); setRem(left);
    const id = setInterval(() => {
      const r = Math.max(0, left - (Date.now() - startT.current) / 1000);
      setRem(r);
      if (r <= 0) { clearInterval(id); judgeRef.current(false, null, true); }
    }, 200);
    return () => clearInterval(id);
  }, [i, result, verdict == null]);
  useEffect(() => { if (verdict && nextBtn.current) nextBtn.current.focus(); }, [verdict]);

  const finish = () => {
    const pct = correct / items.length, stars = hearts <= 0 ? (correct ? 1 : 0) : pct >= .9 ? 3 : pct >= .6 ? 2 : correct ? 1 : 0;
    S.arena.played++; S.arena.best = Math.max(S.arena.best, xp);
    if (topic) { const rec = topicRec(topic.id); rec.stars = Math.max(rec.stars || 0, stars); }
    if (stars === 3) gainXP(40, "three stars"); else { save(); checkBadges(); }
    setResult({stars});
  };
  const last = i + 1 >= items.length || hearts <= 0;
  const next = () => {
    if (last) return finish();
    setI(i + 1); setVerdict(null); setHintUsed(false); setPicked([]); setAns("");
  };
  const submitText = () => { if (!ans.trim()) return; judge(c.answer.some(a => normAns(a) === normAns(ans))); };

  useKeyHandler(e => {
    if (!c || verdict || result) return;
    if (c.type === "bug" && /^[1-9]$/.test(e.key) && +e.key <= c.lines.length) judge(+e.key - 1 === c.bug, +e.key - 1);
  });

  if (!items.length) return <div className="panel empty"><p className="muted">No practical challenges here yet.</p></div>;
  if (result) return (
    <div className="panel result arena-end">
      <div className="stars" aria-label={`${result.stars} of 3 stars`}>{[0, 1, 2].map(k => <span key={k} className={k < result.stars ? "on" : ""}><Glyph name="star" /></span>)}</div>
      <h2 style={{margin:"6px 0"}}>{hearts <= 0 ? "Out of lives" : result.stars === 3 ? "Flawless run" : result.stars === 2 ? "Strong run" : "Run complete"}</h2>
      <p className="muted">{correct} of {items.length} solved, {xp} XP earned. Best run: {S.arena.best} XP.</p>
      <div className="row" style={{justifyContent:"center"}}><button className="btn primary" onClick={onAgain}>Play again</button>{back}</div>
    </div>
  );

  let body;
  if (c.type === "predict" || c.type === "blank") {
    const a = String(c.answer[0]);
    body = (<>
      <Code className="arena-code" code={c.code} />
      <div className="answer-row">
        <input key={i} className="input mono" autoFocus autoComplete="off" spellCheck="false" disabled={!!verdict} value={ans} onChange={e => setAns(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); submitText(); } }}
          placeholder={c.type === "predict" ? "Type the exact output" : "Type the missing code"} aria-label="Your answer" />
        <button className="btn primary" disabled={!!verdict} onClick={submitText}>Submit</button>
      </div>
      <div className="row" style={{marginTop:10}}>
        {hintUsed ? <span className="muted small">Starts with <code>{a.slice(0, Math.max(1, Math.ceil(a.length / 4)))}</code>, {a.length} characters</span>
          : <button className="link" onClick={() => setHintUsed(true)}>Hint (−5 XP)</button>}
        <span className="spacer" /><button className="link" style={{color:"var(--muted)"}} disabled={!!verdict} onClick={() => judge(false)}>Skip</button>
      </div>
    </>);
  } else if (c.type === "bug") {
    body = (<>
      <p className="muted small" style={{margin:"0 0 8px"}}>Tap the line that’s wrong.</p>
      <div className="lines">{c.lines.map((l, k) => {
        const cls = !verdict ? "" : k === c.bug ? " right" : k === verdict.wrong ? " wrong" : "";
        return <button key={k} className={"cl" + cls} disabled={!!verdict} onClick={() => judge(k === c.bug, k)}><span className="ln">{k + 1}</span><HlLine code={l} /></button>;
      })}</div>
    </>);
  } else {
    const order = orders[i];
    const place = k => { if (!verdict) setPicked(picked.concat(k)); };
    const unplace = j => { if (!verdict) setPicked(picked.filter((_, x) => x !== j)); };
    body = (<>
      <p className="muted small" style={{margin:"0 0 8px"}}>Tap the lines in the order they should run. Tap a placed line to send it back.</p>
      <div className="lines built">{picked.length ? picked.map((k, j) => <button key={j} className="cl" onClick={() => unplace(j)}><span className="ln">{j + 1}</span><HlLine code={c.lines[k]} /></button>)
        : <p className="muted small" style={{margin:"6px 4px"}}>Your program builds here.</p>}</div>
      <div className="lines pool">{order.filter(k => !picked.includes(k)).map(k => <button key={k} className="cl" onClick={() => place(k)}><HlLine code={c.lines[k]} /></button>)}</div>
      <div className="row" style={{marginTop:12}}><button className="btn primary" disabled={picked.length !== c.lines.length || !!verdict} onClick={() => judge(picked.every((k, j) => c.lines[k] === c.lines[j]))}>Check order</button></div>
    </>);
  }
  const reveal = c.type === "bug" ? <>Fix: <code>{c.fix}</code></> : c.type === "order" ? <Code className="arena-code small" code={c.lines.join("\n")} /> : <>Answer: <code>{c.answer[0]}</code></>;
  const left = limit(c);
  return (<>
    <div className="arena-hud"><Hearts n={hearts} />
      <span className="ah-mid">Challenge {i + 1} of {items.length}</span>
      <span className={"combo" + (combo > 1 ? " hot" : "")}><Icon name="fire" />×{Math.max(1, Math.min(combo, 3))}</span><span className="xp-now">{xp} XP</span></div>
    <div className="timer"><span className={rem < 15 ? "low" : ""} style={{width:(verdict ? 0 : rem / left * 100) + "%"}} /></div>
    <div className="panel qcard arena" style={{"--wc":c.color}}>
      <div className="row" style={{justifyContent:"space-between"}}><span className="ptype"><Icon name="code" />{PTYPE[c.type]}</span><Tag color={c.color}>{c.topic}</Tag></div>
      {body}
      {verdict ? <div className="explain">
        <p><strong style={{color:`var(${verdict.ok ? "--good" : "--bad"})`}}>{verdict.ok ? `Solved in ${Math.round(verdict.secs)}s.` : verdict.timeout ? "Time’s up." : "Not quite."}</strong> {verdict.ok ? null : reveal} <Fmt text={c.explain || ""} /></p>
        <button className="btn primary" ref={nextBtn} onClick={next}>{last ? "See results" : "Next challenge"}</button>
      </div> : null}
    </div>
  </>);
}
