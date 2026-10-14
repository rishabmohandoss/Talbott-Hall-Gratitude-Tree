import { subscribe, DEMO } from "./data.js";

const NS = "http://www.w3.org/2000/svg";
const el = (n, a = {}) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
const rng = s => () => (s = (s + 0x6D2B79F5) | 0, ((t => ((t = Math.imul(t ^ (t >>> 15), t | 1)) ^ (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t) >>> 0) / 4294967296)(s));

// --- build a fixed fractal tree; branches are revealed in breadth-first order as leaves are added
const rnd = rng(11);
const branches = [], q = [{ x: 0, y: 0, a: -90, len: 130, w: 24, d: 0 }];
while (q.length) {
  const b = q.shift();
  const r = b.a * Math.PI / 180;
  b.x2 = b.x + Math.cos(r) * b.len; b.y2 = b.y + Math.sin(r) * b.len;
  b.i = branches.length; branches.push(b);
  if (b.d < 8) {
    const kids = b.d === 0 ? [-8, 8] : (rnd() < .25 ? [-34, 0, 30] : [-28, 26]);
    for (const k of kids) q.push({ x: b.x2, y: b.y2, a: b.a + k + (rnd() - .5) * 14, len: b.len * (.76 + rnd() * .06), w: Math.max(b.w * .68, 1.5), d: b.d + 1 });
  }
}
const slots = [];
for (const b of branches) if (b.d >= 2) for (const t of [.55, 1]) {
  slots.push({ x: b.x + (b.x2 - b.x) * t + (rnd() - .5) * 14, y: b.y + (b.y2 - b.y) * t + (rnd() - .5) * 14, bi: b.i, rot: rnd() * 360 });
}

const svg = document.getElementById("tree");
const xs = branches.flatMap(b => [b.x, b.x2]), ys = branches.flatMap(b => [b.y, b.y2]);
const [x0, x1, y0, y1] = [Math.min(...xs) - 40, Math.max(...xs) + 40, Math.min(...ys) - 40, 30];
svg.setAttribute("viewBox", `${x0} ${y0} ${x1 - x0} ${y1 - y0}`);
const ground = el("ellipse", { cx: 0, cy: 8, rx: (x1 - x0) / 3, ry: 14, fill: "#c9b28a", opacity: .5 });
const gB = el("g"), gL = el("g");
svg.append(ground, gB, gL);

const lines = branches.map(b => {
  const p = el("path", { d: `M${b.x},${b.y} L${b.x2},${b.y2}`, "stroke-width": b.w, pathLength: 1, class: "branch" });
  gB.append(p); return p;
});

const LEAF = "M0,-20 L4,-12 L10,-16 L8,-6 L18,-8 L12,0 L18,6 L8,6 L6,12 L1,10 L1,20 L-1,20 L-1,10 L-6,12 L-8,6 L-18,6 L-12,0 L-18,-8 L-8,-6 L-10,-16 L-4,-12 Z";
const COLORS = ["#d9480f", "#e8590c", "#f08c00", "#c92a2a", "#e67700", "#a61e4d", "#f59f00", "#b5541c"];
const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

const seen = new Set();
let first = true;
const card = document.getElementById("card");
const wall = document.getElementById("wall");

function show(l) {
  card.querySelector("p").textContent = "“" + l.text + "”";
  card.querySelector("small").textContent = (l.name ? "— " + l.name + " · " : "") + new Date(l.createdAt).toLocaleDateString();
  card.hidden = false;
}
card.querySelector("button").onclick = () => card.hidden = true;

function render(leaves) {
  document.getElementById("count").textContent = leaves.length;
  const n = leaves.length;
  const need = slots[Math.min(n, slots.length) - 1]?.bi ?? 0;
  const visible = Math.min(branches.length, Math.max(7, need + 6));
  lines.forEach((p, i) => p.classList.toggle("on", i < visible));

  gL.replaceChildren();
  leaves.forEach((l, i) => {
    const s = slots[i % slots.length], lap = Math.floor(i / slots.length), h = hash(l.id);
    const g = el("g", { class: "leaf" + (!first && !seen.has(l.id) ? " new" : ""), tabindex: 0, role: "button", "aria-label": "Leaf: " + l.text });
    const jx = lap * 9, jy = lap * 7;
    g.style.setProperty("--t", `translate(${s.x + jx}px, ${s.y + jy}px) rotate(${s.rot}deg) scale(${.9 + (h % 5) / 10})`);
    g.append(el("path", { d: LEAF, fill: COLORS[h % COLORS.length] }));
    g.onclick = () => show(l);
    g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") show(l); };
    gL.append(g);
    seen.add(l.id);
  });
  first = false;

  wall.replaceChildren();
  [...leaves].reverse().forEach(l => {
    const li = document.createElement("li");
    const p = document.createElement("p"); p.textContent = l.text;
    const s = document.createElement("small"); s.textContent = l.name ? "— " + l.name : "— a resident";
    li.append(p, s); wall.append(li);
  });
  if (!n) wall.innerHTML = "<li class='empty'>No leaves yet — be the first!</li>";
}

document.getElementById("demo").hidden = !DEMO;
subscribe(render);
