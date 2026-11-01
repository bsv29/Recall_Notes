/* ================= toasts, modal & level up ================= */
import {useEffect, useRef} from "react";
import {toasts, overlay, closeModal} from "../lib/store.js";

export function Toasts(){
  return <div id="toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className={"toast" + (t.gold ? " gold" : "")}>{t.msg}</div>)}</div>;
}

function Confirm({m}){
  const answer = v => { m.resolve(v); m.resolve = null; closeModal(); };
  return (<>
    <h2>{m.title}</h2><p className="muted">{m.body}</p>
    <div className="row"><button className="btn" onClick={() => answer(false)}>Cancel</button><button className={"btn " + (m.danger ? "danger" : "primary")} data-focus onClick={() => answer(true)}>{m.ok}</button></div>
  </>);
}

function LevelUp({m}){
  return (<>
    <div className="burst" aria-hidden="true">{Array.from({length:16}, (_, i) => <i key={i} style={{"--a":i * 22.5 + "deg"}} />)}</div>
    <div className="center"><p className="muted">Level up</p><div className="lvnum">Level {m.level}</div>
      <p style={{marginTop:10}}>You’re now a <strong>{m.rank}</strong>. Keep the streak going.</p>
      <div className="row" style={{justifyContent:"center"}}><button className="btn primary" data-focus onClick={closeModal}>Keep going</button></div></div>
  </>);
}

export function ModalHost(){
  const box = useRef(null);
  useEffect(() => {
    if (!overlay || !box.current) return;
    const f = box.current.querySelector("[data-focus]") || box.current.querySelector("button");
    if (f) f.focus();
  }, [overlay]);
  if (!overlay) return <div id="overlay" hidden />;
  const m = overlay;
  return (
    <div id="overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="modal" role="dialog" aria-modal="true" ref={box}>
        {m.kind === "confirm" ? <Confirm m={m} /> : m.kind === "levelup" ? <LevelUp m={m} /> : m.render(closeModal)}
      </div>
    </div>
  );
}
