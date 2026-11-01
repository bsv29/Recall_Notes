/* ================= skills & content ================= */
import {PY, NP, PD, PT, C_JAVA, C_JS, C_REACT, C_TW, C_SQL, C_JFS, C_PFS, C_MPL, C_SNS, C_SK, C_ML, C_DL, C_NLP, C_TF, C_LLM, C_RAG, PRAC_EXTRA} from "../data/index.js";

export const FORMATS = [
  {id:"notes", name:"Notes", icon:"notes", desc:"Key points, a code example and interview traps"},
  {id:"cheat", name:"Cheat sheet", icon:"sheet", desc:"The whole topic on one dense card"},
  {id:"revision", name:"Revision", icon:"review", desc:"Spaced-repetition flashcards"},
  {id:"interview", name:"Interview", icon:"mic", desc:"Mock interview questions with model answers"},
  {id:"quiz", name:"Quiz", icon:"bolt", desc:"Multiple choice with combos and boss battles"},
  {id:"practical", name:"Practical", icon:"code", desc:"Timed code challenges in the arena"}
];
export const FMT = Object.fromEntries(FORMATS.map(f => [f.id, f]));
export const ALL_FMTS = FORMATS.map(f => f.id);
function autoPrac(t){
  const lines = t.code.split("\n"), out = [];
  const BAD = /\b(then|total|not|about|runs|works|changed|unchanged|pretend|no|remembered|matrix|product|element|solves|view|copy|rows|row|only|AND|per|overriding|wise|max|index|done|keys|case|happened|because)\b/i;
  lines.forEach((ln, i) => {
    const m = ln.match(/^(\s*(?:print|console\.log|System\.out\.println)\(.*\);?)\s+(?:#|\/\/)\s*(.+)$/);
    if (m && out.length < 2) {
      const ans = m[2].trim().split(/\s{2,}/)[0];
      if (ans.length <= 40 && !BAD.test(ans) && !/[A-Za-z]+ \d+,/.test(ans)) out.push({type:"predict", code:lines.slice(0, i).concat([m[1]]).join("\n"), answer:[ans], explain:"It prints `" + ans + "`."});
    }
  });
  const c = [];
  lines.forEach((ln, i) => { if (/^\s*(#|\/\/|--\s)/.test(ln)) return; const cp = ln.split(/\s(?:#|\/\/)\s/)[0]; const re = /\.([a-z_][a-z0-9_]{2,})\(/g; let m; while ((m = re.exec(cp))) c.push({i, tok:m[1], pos:m.index + 1}); });
  const used = new Set(), lns = new Set(); let n = 0;
  [0, Math.floor(c.length / 2), c.length - 1].forEach(k => {
    const x = c[k]; if (!x || n >= 2 || used.has(x.tok) || lns.has(x.i)) return;
    used.add(x.tok); lns.add(x.i); n++;
    const L = lines.slice(); L[x.i] = L[x.i].slice(0, x.pos) + "____" + L[x.i].slice(x.pos + x.tok.length);
    out.push({type:"blank", code:L.join("\n"), answer:[x.tok], explain:"The missing name is `" + x.tok + "`."});
  });
  return (t.prac || []).concat(out, PRAC_EXTRA[t.id] || []);
}
export const CATS = [
  {id:"lang", name:"Programming languages"},
  {id:"web", name:"Web & full stack"},
  {id:"data", name:"Data analysis & visualization"},
  {id:"ai", name:"Machine learning & AI"},
  {id:"mine", name:"My courses"}
];
export const BUILTIN = [
  {id:"python", cat:"lang", name:"Python", color:"var(--py)", icon:"🐍", blurb:"Core language, OOP, memory and concurrency", topics:PY},
  {id:"java", cat:"lang", name:"Java", color:"#D96A00", icon:"☕", blurb:"Syntax, OOP, collections, exceptions and threads", topics:C_JAVA},
  {id:"javascript", cat:"lang", name:"JavaScript", color:"#B89200", icon:"🟨", blurb:"Types, arrays, async and closures", topics:C_JS},
  {id:"sql", cat:"lang", name:"SQL", color:"#336791", icon:"🗄️", blurb:"Queries, joins, aggregates and window functions", topics:C_SQL},
  {id:"react", cat:"web", name:"React", color:"#149ECA", icon:"⚛️", blurb:"Components, hooks, patterns and performance", topics:C_REACT},
  {id:"tailwind", cat:"web", name:"Tailwind CSS", color:"#0891B2", icon:"🎨", blurb:"Utilities, layout, responsive design and config", topics:C_TW},
  {id:"javafs", cat:"web", name:"Java Full Stack", color:"#5B9A2E", icon:"🧱", blurb:"Spring Boot, REST, JPA, security and deployment", topics:C_JFS},
  {id:"pyfs", cat:"web", name:"Python Full Stack", color:"#00897B", icon:"🧩", blurb:"FastAPI, Django, auth and deployment", topics:C_PFS},
  {id:"numpy", cat:"data", name:"NumPy", color:"var(--np)", icon:"🔢", blurb:"Arrays, views, broadcasting and linear algebra", topics:NP},
  {id:"pandas", cat:"data", name:"Pandas", color:"var(--pd)", icon:"🐼", blurb:"Selection, cleaning, grouping and speed", topics:PD},
  {id:"matplotlib", cat:"data", name:"Matplotlib", color:"#11557C", icon:"📈", blurb:"Figures, chart types, layouts and ML visuals", topics:C_MPL},
  {id:"seaborn", cat:"data", name:"Seaborn", color:"#7A5195", icon:"📊", blurb:"Statistical plots, heatmaps and EDA", topics:C_SNS},
  {id:"sklearn", cat:"ai", name:"scikit-learn", color:"#E08A00", icon:"🧪", blurb:"Estimators, pipelines, models and tuning", topics:C_SK},
  {id:"ml", cat:"ai", name:"Machine Learning", color:"#2E7D32", icon:"🤖", blurb:"Fundamentals, regression, trees and production", topics:C_ML},
  {id:"dl", cat:"ai", name:"Deep Learning", color:"#7B1FA2", icon:"🧠", blurb:"Networks, training, regularization and architectures", topics:C_DL},
  {id:"pytorch", cat:"ai", name:"PyTorch", color:"var(--pt)", icon:"🔥", blurb:"Tensors, autograd and training loops", topics:PT},
  {id:"nlp", cat:"ai", name:"NLP", color:"#C2185B", icon:"💬", blurb:"Preprocessing, vectors, tasks and modern models", topics:C_NLP},
  {id:"transformers", cat:"ai", name:"Transformers", color:"#00838F", icon:"🔁", blurb:"Attention, blocks, model families and fine-tuning", topics:C_TF},
  {id:"llm", cat:"ai", name:"LLMs", color:"#3949AB", icon:"🗣️", blurb:"How LLMs work, prompting, apps and safety", topics:C_LLM},
  {id:"rag", cat:"ai", name:"RAG", color:"#E65100", icon:"🔎", blurb:"Retrieval, indexing, reranking and evaluation", topics:C_RAG}
];
export const LVL = {B:"Basic", I:"Intermediate", A:"Advanced"};
BUILTIN.forEach(w => { w.formats = ALL_FMTS; const n = w.topics.length; w.topics.forEach((t, i) => {
  if (!t.lvl) t.lvl = i < n * 0.34 ? "B" : i < n * 0.75 ? "I" : "A";
  t.iq = t.cards.map(c => [c[0], c[1]]).concat(t.traps.map(x => ["What’s a common mistake with " + t.t.toLowerCase() + "?", x]));
  t.prac = autoPrac(t);
}); });
export const emptyTopic = (id, t) => ({id, t, hook:"", sum:"", pts:[], code:"", traps:[], cards:[], quiz:[], iq:[], prac:[]});
export function topicFormats(t){
  const has = {notes:t.pts.length > 0, cheat:t.pts.length > 0, revision:t.cards.length > 0, interview:t.iq.length > 0, quiz:t.quiz.length > 0, practical:t.prac.length > 0};
  return t.world.formats.filter(f => has[f]);
}
export const skillColors = ["#0E8580", "#5B45D6", "#C94A22", "#2F7DD1", "#B0367A", "#3F8F3A", "#9A6B00", "#475569"];
export const skillIcons = ["🧠", "🗄️", "☁️", "⚛️", "🐳", "📊", "🤖", "🔐", "🧪", "📈", "🌐", "🛠️"];
export const STATUS = {new:"New", learning:"Learning", strong:"Strong", fading:"Fading", planned:"Not generated"};
