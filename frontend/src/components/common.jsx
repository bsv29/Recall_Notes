/* ================= shared building blocks ================= */
import {Fragment, useState} from "react";
import {fmt, hl} from "../lib/text.js";
import {STATUS} from "../lib/courses.js";
import {MAXBOX, go} from "../lib/store.js";
import {Icon, Glyph} from "./icons.jsx";

/* fmt() and hl() escape their input before adding markup, so injecting the result is safe */
export const Fmt = ({text, as:Tag = "span", className, style}) => <Tag className={className} style={style} dangerouslySetInnerHTML={{__html:fmt(text)}} />;
export const Code = ({code, className}) => <pre className={className}><code dangerouslySetInnerHTML={{__html:hl(code)}} /></pre>;
export const HlLine = ({code}) => <code dangerouslySetInnerHTML={{__html:hl(code) || " "}} />;

export const Pill = ({s}) => <span className={"pill " + s}>{STATUS[s]}</span>;
export const Meter = ({avg, color}) => (
  <span className="meter" style={{"--wc":color}} title={`Memory strength ${avg.toFixed(1)} of ${MAXBOX}`}>
    {Array.from({length:MAXBOX}, (_, i) => <i key={i} className={i < Math.round(avg) ? "on" : ""} />)}
  </span>
);
export const Dot = ({color}) => <span className="dot" style={color ? {"--wc":color} : undefined} />;
export const Tag = ({color, children}) => <span className="tag"><Dot color={color} />{children}</span>;
export const Ring = ({p, small, children}) => <span className={"ring" + (small ? " sm" : "")} style={{"--p":p}}><span>{children}</span></span>;
export const Bar = ({pct, style}) => <div className="bar" style={style}><span style={{width:pct + "%"}} /></div>;
export const Hearts = ({n}) => (
  <span className="hearts" aria-label={`${n} lives left`}>
    {Array.from({length:n}, (_, k) => <Glyph key={k} name="heart" />)}
    <span className="lost">{Array.from({length:3 - n}, (_, k) => <Glyph key={k} name="heart" />)}</span>
  </span>
);
export const StarsSm = ({n}) => n ? <span className="stars-sm">{[0, 1, 2].map(k => <Glyph key={k} name={k < n ? "star" : "starOff"} />)}</span> : null;

/* parts: [{label, to}] where `to` is a route, or plain strings for the current page */
export function Crumbs({parts}){
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <button onClick={() => go("dashboard")}>Dashboard</button>
      {parts.map((p, k) => <Fragment key={k}><span aria-hidden="true">/</span>{typeof p === "string" ? <span>{p}</span> : <button onClick={p.onClick || (() => go(p.to))}>{p.label}</button>}</Fragment>)}
    </nav>
  );
}

export function CopyBtn({text, data}){
  const [label, setLabel] = useState("Copy");
  const copy = async () => { try { await navigator.clipboard.writeText(text); setLabel("Copied"); } catch (e) { setLabel("Select to copy"); } };
  return <button className="copy" data-copy={data} onClick={copy}>{label}</button>;
}

export const PrintBtn = ({className = "btn"}) => <button className={className} onClick={() => window.print()}><Icon name="print" />Print</button>;

export function CheatCard({t}){
  return (
    <article className="panel cs" style={{"--wc":t.world.color}}>
      <h3>{t.t}</h3>
      {t.hook ? <Fmt as="p" className="hk" text={t.hook} /> : null}
      <ul>{t.pts.map((p, k) => <Fmt key={k} as="li" text={p} />)}</ul>
      {t.traps.length ? <div className="tr">{t.traps.map((x, k) => <div key={k}><Glyph name="warn" /> <Fmt text={x} /></div>)}</div> : null}
      {t.code ? <Code code={t.code} /> : null}
    </article>
  );
}

export const BrandMark = () => <span className="mark"><Glyph name="brain" /></span>;
export const Brand = () => <div className="brand"><BrandMark />Recall</div>;

export const CurveSVG = () => (
  <svg viewBox="0 0 420 190" role="img" aria-label="Forgetting curve: memory drops quickly without review; each spaced review resets it and the decay gets slower.">
    <line x1="24" y1="170" x2="410" y2="170" stroke="#2B3150" strokeWidth="1.5" />
    <line x1="24" y1="14" x2="24" y2="170" stroke="#2B3150" strokeWidth="1.5" />
    <text x="30" y="12" fill="#7E869C" fontSize="10" fontFamily="Atkinson Hyperlegible,sans-serif">memory</text>
    <text x="372" y="184" fill="#7E869C" fontSize="10" fontFamily="Atkinson Hyperlegible,sans-serif">time</text>
    <path className="draw" d="M24,22 C70,110 140,150 408,164" fill="none" stroke="#F06B6F" strokeWidth="2.5" strokeDasharray="6 6" />
    <path className="draw" d="M24,22 C40,62 56,72 72,76 L72,22 C104,56 124,62 146,64 L146,22 C192,46 222,51 256,52 L256,22 C318,34 360,37 408,38" fill="none" stroke="var(--acc)" strokeWidth="3" strokeLinejoin="round" />
    <g fill="var(--acc)"><circle cx="72" cy="22" r="4" /><circle cx="146" cy="22" r="4" /><circle cx="256" cy="22" r="4" /></g>
    <g fill="#B9C0D4" fontSize="10" fontFamily="Atkinson Hyperlegible,sans-serif"><text x="56" y="16">day 1</text><text x="130" y="16">day 3</text><text x="240" y="16">day 7</text></g>
  </svg>
);

/* multiple-choice options shared by quizzes and checkpoints */
const isCodey = o => /[()\[\]{}'"=_@*`]|^-?\d/.test(o);
export function Options({q, picked, onPick}){
  return (
    <div className="opts">
      {q.opts.map((o, k) => {
        const cls = picked == null ? "" : k === q.ans ? " right" : k === picked ? " wrong" : "";
        return <button key={k} className={"opt" + (isCodey(o) ? " mono" : "") + cls} disabled={picked != null} onClick={() => onPick(k)}><span className="key">{"ABCD"[k]}</span><span>{o}</span></button>;
      })}
    </div>
  );
}
