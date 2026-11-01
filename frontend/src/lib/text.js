/* ================= text helpers ================= */
export const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/* escapes first, then turns `code` and **bold** into HTML, so the result is safe to inject */
export function fmt(s){
  return esc(s).replace(/`([^`]+)`/g, (m, c) => "<code>" + c + "</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
export const plain = s => String(s).replace(/\*\*/g, "");
const KW = new Set("function const let var new this null true false undefined typeof instanceof export default extends implements interface public private protected static final void int double boolean long char throws throw catch package abstract super switch case SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER FULL ON GROUP BY ORDER HAVING LIMIT AS AND OR NOT NULL IS IN BETWEEN LIKE WITH OVER PARTITION DESC ASC INSERT UPDATE SET DELETE BEGIN COMMIT DISTINCT CREATE TABLE def class return if elif else for while in not and or is None True False import from as with try except finally raise yield lambda pass break continue async await global nonlocal del assert".split(" "));
const BI = new Set("print len range list dict set tuple int float str bool type isinstance enumerate zip sorted super open sum min max map filter round self".split(" "));
/* syntax highlighting: escapes everything it emits */
export function hl(code){
  const re = /(#[^\n]*|\/\/[^\n]*|--\s[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b([A-Za-z_][A-Za-z0-9_]*)\b|\b(\d+(?:\.\d+)?(?:e-?\d+)?)\b/g;
  let out = "", last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    if (m[1]) out += '<span class="c">' + esc(m[1]) + "</span>";
    else if (m[2]) out += '<span class="s">' + esc(m[2]) + "</span>";
    else if (m[3]) out += KW.has(m[3]) ? '<span class="k">' + m[3] + "</span>" : BI.has(m[3]) ? '<span class="b">' + m[3] + "</span>" : m[3];
    else out += '<span class="n">' + m[4] + "</span>";
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
}
export function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const tday = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
export const dayLabel = d => new Date(d * 864e5).toLocaleDateString(undefined, {timeZone:"UTC", month:"short", day:"numeric"});
