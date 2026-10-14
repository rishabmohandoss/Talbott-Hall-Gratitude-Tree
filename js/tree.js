import { subscribe, DEMO } from "./data.js";

const NS = "http://www.w3.org/2000/svg";
const el = (n, a = {}) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
const rng = s => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const R = rng(7);
const f = n => n.toFixed(1);

const LEAF = "M0,-20 L4,-12 L10,-16 L8,-6 L18,-8 L12,0 L18,6 L8,6 L6,12 L1,10 L1,20 L-1,20 L-1,10 L-6,12 L-8,6 L-18,6 L-12,0 L-18,-8 L-8,-6 L-10,-16 L-4,-12 Z";
const PAL = ["#6e1f14", "#9c2b1a", "#c53d1b", "#dd5a1a", "#ee7d1c", "#f6a022", "#fcc04a", "#ffd978"];
const TAGS = ["#ffcf56", "#ff9d4d", "#ffe2b0", "#f58b6a", "#ffc078", "#fff0cf", "#ffb347"];
const CX = 800, BASE = 890;

// ---------- static scene ----------
function bgTrees() {
  let s = "";
  for (const [x, h, k] of [[330, 150, .9], [470, 190, 1], [600, 140, .8], [1020, 170, .95], [1360, 165, 1], [1510, 200, 1.1]]) {
    s += `<rect x="${x - 5}" y="${800 - h * .5}" width="10" height="${h * .5}" fill="#4a2b22"/>`;
    for (let i = 0; i < 6; i++) s += `<ellipse cx="${f(x + (R() - .5) * 90 * k)}" cy="${f(800 - h + (R() - .2) * 70)}" rx="${f(48 * k)}" ry="${f(40 * k)}" fill="${["#8a2b30", "#a63a2c", "#7a2430", "#b5482a"][i % 4]}" opacity=".93"/>`;
  }
  return s;
}
function bushes(y0, y1, n, cols, rmin, rmax) {
  let s = "";
  for (let i = 0; i < n; i++) s += `<ellipse cx="${f(R() * 1700 - 50)}" cy="${f(y0 + R() * (y1 - y0))}" rx="${f(rmin + R() * (rmax - rmin))}" ry="${f((rmin + R() * (rmax - rmin)) * .62)}" fill="${cols[i % cols.length]}"/>`;
  return s;
}
function scene() {
  const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#win)"/>`;
  return `
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a96e4"/><stop offset=".4" stop-color="#9fcdf3"/><stop offset=".75" stop-color="#fde0ae"/></linearGradient>
  <radialGradient id="sun" cx="430" cy="430" r="650" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbe0" stop-opacity="1"/><stop offset=".25" stop-color="#ffe9a8" stop-opacity=".6"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  <linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b9a3a"/><stop offset="1" stop-color="#3f5a24"/></linearGradient>
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <pattern id="win" width="52" height="70" patternUnits="userSpaceOnUse"><rect x="11" y="14" width="30" height="42" fill="#6b3a36" stroke="#a82a2a" stroke-width="3.5"/><rect x="25" y="14" width="2" height="42" fill="#a82a2a"/></pattern>
  <path id="lf" d="${LEAF}"/>
  <filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="bl2"><feGaussianBlur stdDeviation="1.3"/></filter>
</defs>
<rect width="1600" height="1000" fill="url(#sky)"/>
<rect width="1600" height="1000" fill="url(#sun)"/>
<g fill="#fff" opacity=".8" filter="url(#bl)"><ellipse cx="1180" cy="150" rx="190" ry="26"/><ellipse cx="1320" cy="190" rx="150" ry="20"/><ellipse cx="340" cy="120" rx="170" ry="22"/><ellipse cx="700" cy="70" rx="120" ry="16"/></g>
<g filter="url(#bl2)">
  <rect x="-20" y="330" width="1640" height="470" fill="#cdb58f"/>
  <rect x="-20" y="290" width="620" height="510" fill="#d6c09a"/><rect x="-20" y="282" width="620" height="14" fill="#b9a27c"/>
  <rect x="1010" y="180" width="640" height="620" fill="#d8c39d"/><rect x="1010" y="170" width="640" height="14" fill="#b9a27c"/>
  <rect x="600" y="470" width="410" height="330" fill="#c9b189"/>
  ${win(20, 320, 560, 460)}${win(1030, 200, 590, 580)}${win(620, 490, 370, 290)}
  <rect x="1090" y="690" width="210" height="110" fill="#b69d76"/><rect x="1150" y="730" width="90" height="70" fill="#3d2a22"/>
  <text x="1195" y="716" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="18" fill="#5b3a2a" letter-spacing="2">TALBOTT HALL</text>
  <rect x="-20" y="282" width="1700" height="520" fill="url(#haze)"/>
</g>
${bgTrees()}
<rect y="770" width="1600" height="230" fill="url(#lawn)"/>
<ellipse cx="200" cy="900" rx="300" ry="60" fill="#8a3f26"/><ellipse cx="1420" cy="905" rx="300" ry="60" fill="#8a3f26"/>
<path d="M-50,965 C300,905 560,915 780,985 S1300,1005 1700,935" stroke="#ecdcb8" stroke-width="80" fill="none"/>
${bushes(790, 830, 34, ["#3d5a2a", "#55702f", "#2f4a22", "#a8431f", "#6f8a35"], 40, 90)}
<g fill="#7a1f2b"><rect x="350" y="775" width="80" height="9"/><rect x="350" y="755" width="80" height="6"/><rect x="1370" y="785" width="90" height="9"/><rect x="1370" y="764" width="90" height="6"/><rect x="465" y="760" width="34" height="46" rx="4"/></g>
${bushes(820, 860, 22, ["#3d5a2a", "#55702f", "#a8431f", "#c9561a"], 50, 100)}`;
}

// ---------- trunk and branches ----------
function trunk() {
  const rb = rng(21), br = [], q = [{ x: CX, y: BASE, a: -90, len: 170, w: 80, d: 0 }];
  while (q.length) {
    const b = q.shift(), r = b.a * Math.PI / 180;
    b.x2 = b.x + Math.cos(r) * b.len; b.y2 = b.y + Math.sin(r) * b.len; b.w2 = b.w * .72; br.push(b);
    if (b.d < 7) for (const k of b.d === 0 ? [-24, 22] : rb() < .3 ? [-38, -2, 34] : [-32, 28])
      q.push({ x: b.x2, y: b.y2, a: b.a + k + (rb() - .5) * 16, len: b.len * (.8 + rb() * .06), w: b.w2, d: b.d + 1 });
  }
  let s = `<path d="M720,900 Q775,885 772,800 L828,800 Q825,885 885,900 Z" fill="#4a2f21"/>`;
  for (const b of br) {
    const dx = b.x2 - b.x, dy = b.y2 - b.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, h0 = b.w / 2, h1 = b.w2 / 2;
    s += `<path d="M${f(b.x + nx * h0)},${f(b.y + ny * h0)}L${f(b.x2 + nx * h1)},${f(b.y2 + ny * h1)}L${f(b.x2 - nx * h1)},${f(b.y2 - ny * h1)}L${f(b.x - nx * h0)},${f(b.y - ny * h0)}Z" fill="#4a2f21"/><circle cx="${f(b.x2)}" cy="${f(b.y2)}" r="${f(h1)}" fill="#4a2f21"/>`;
    s += `<path d="M${f(b.x - nx * h0 * .45)},${f(b.y - ny * h0 * .45)}L${f(b.x2 - nx * h1 * .45)},${f(b.y2 - ny * h1 * .45)}" stroke="#80573a" stroke-opacity=".7" stroke-width="${f(Math.max(1, b.w * .14))}" stroke-linecap="round"/>`;
    if (b.d < 3) for (let i = 0; i < 3; i++) { const t = R(), o = (R() - .5) * b.w * .6; s += `<path d="M${f(b.x + dx * t * .8 + nx * o)},${f(b.y + dy * t * .8 + ny * o)}l${f(dx * .22)},${f(dy * .22)}" stroke="#25150e" stroke-opacity=".55" stroke-width="2"/>`; }
  }
  s += `<ellipse cx="${CX}" cy="896" rx="210" ry="24" fill="#d6862a" opacity=".85"/><ellipse cx="${CX}" cy="898" rx="170" ry="14" fill="#f0a63a" opacity=".8"/>`;
  return s;
}

// ---------- canopy: clumps of small maple leaves, revealed from the center outward ----------
const clumps = [];
for (let gy = 110; gy < 660; gy += 88) for (let gx = 270; gx < 1340; gx += 100) {
  const x = gx + (R() - .5) * 70 + (gy / 88 % 2 ? 40 : 0), y = gy + (R() - .5) * 60;
  const e = ((x - CX) / 560) ** 2 + ((y - 380) / 320) ** 2;
  if (e < 1 && !(y > 560 && Math.abs(x - CX) < 100) && !(y > 520 && e > .7)) clumps.push({ x, y, k: Math.hypot((x - CX) / 1.4, y - 420) * (.7 + R() * .6) });
}
clumps.sort((a, b) => a.k - b.k);
const pick = (x, y, rr) => PAL[Math.max(0, Math.min(PAL.length - 1, Math.floor((.5 * (1 - (y - 120) / 560) + .28 * (1 - x / 1600) + rr * .5 - .15) * PAL.length)))];
function clumpSvg(c, i) {
  let s = `<circle cx="${f(c.x)}" cy="${f(c.y)}" r="68" fill="#7a2216"/>`;
  for (let j = 0; j < 40; j++) {
    const a = R() * 6.283, r = 98 * Math.sqrt(R()), x = c.x + Math.cos(a) * r, y = c.y + Math.sin(a) * r * .85;
    s += `<use href="#lf" transform="translate(${f(x)} ${f(y)}) rotate(${f(R() * 360)}) scale(${f(.55 + R() * .45)})" fill="${pick(x, y, R())}"/>`;
  }
  return `<g class="clump" data-i="${i}"><g class="sway" style="--d:${f(4 + R() * 3)}s;--dl:-${f(R() * 6)}s;transform-origin:${f(c.x)}px ${f(c.y)}px">${s}</g></g>`;
}

// ---------- falling leaves + blurred foreground leaves ----------
function fallers() {
  let s = "";
  for (let i = 0; i < 14; i++) s += `<g class="fall" style="--x:${f(R() * 1500)}px;--d:${f(14 + R() * 12)}s;--dl:-${f(R() * 20)}s"><use href="#lf" fill="${PAL[3 + (i % 5)]}" transform="scale(${f(.7 + R() * .6)})"/></g>`;
  for (const [x, y, k, c] of [[40, 70, 4, "#ee7d1c"], [1550, 930, 5, "#d9480f"], [120, 930, 6, "#f6a022"], [1480, 40, 3.5, "#e8590c"], [700, 20, 2.5, "#f6a022"]])
    s += `<use href="#lf" transform="translate(${x} ${y}) rotate(${f(R() * 360)}) scale(${k})" fill="${c}" filter="url(#bl)" opacity=".85"/>`;
  return s;
}

const svg = document.getElementById("tree");
svg.innerHTML = scene() + `<g class="wind"><g>${trunk()}</g><g id="canopy">${clumps.map(clumpSvg).join("")}</g><g id="tags"></g></g>` +
  `<rect width="1600" height="1000" fill="url(#sun)" opacity=".45" style="mix-blend-mode:screen;pointer-events:none"/><g style="pointer-events:none">${fallers()}</g>`;
const clumpEls = [...svg.querySelectorAll(".clump")], gT = svg.getElementById("tags");

// ---------- hanging tags ----------
const slots = [];
for (let n = 0; n < 4000 && slots.length < 150; n++) {
  const x = CX + (R() - .5) * 960, y = 230 + R() * 380;
  if (((x - CX) / 480) ** 2 + ((y - 410) / 210) ** 2 > 1 || (y > 520 && Math.abs(x - CX) < 90)) continue;
  if (slots.some(s => Math.hypot(s.x - x, s.y - y) < 62)) continue;
  slots.push({ x, y, L: 30 + R() * 70, rot: (R() - .5) * 16, r: R(), c: TAGS[Math.floor(R() * TAGS.length)] });
}
slots.sort((a, b) => Math.hypot(a.x - CX, a.y - 420) * (.7 + a.r * .6) - Math.hypot(b.x - CX, b.y - 420) * (.7 + b.r * .6));

const TOOTH = (() => { let d = ""; for (let i = 0; i < 36; i++) { const a = i / 36 * 6.2832, r = i % 2 ? .9 : 1; d += (i ? "L" : "M") + f(Math.cos(a) * r * 39) + "," + f(Math.sin(a) * r * 43); } return d + "Z"; })();
const BLANK = "M0,-30 C20,-14 24,10 0,32 C-24,10 -20,-14 0,-30Z";
const wrap = t => { const w = t.split(/\s+/), L = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > 11 && c) { L.push(c); c = x; } else c = (c + " " + x).trim(); } if (c) L.push(c); return L.length > 3 ? [...L.slice(0, 2), L[2].slice(0, 9) + "…"] : L; };

const card = document.getElementById("card"), wall = document.getElementById("wall");
const show = l => {
  card.querySelector("p").textContent = "“" + l.text + "”";
  card.querySelector("small").textContent = l.sample ? "Example leaf — add yours!" : (l.name ? "— " + l.name + " · " : "") + new Date(l.createdAt).toLocaleDateString();
  card.hidden = false;
};
card.querySelector("button").onclick = () => card.hidden = true;

const seen = new Set(); let first = true;
// Example leaves keep the tree looking alive before residents add theirs; real leaves replace them one by one.
const SAMPLES = ["Proud of you", "You got this!", "Better days ahead", "Grateful for this community", "Finish the semester strong", "Call my mom more", "Be kind to myself", "Thankful for my roommate"]
  .map((text, i) => ({ id: "sample" + i, text, name: "Example", createdAt: 0, sample: true }));

function render(real) {
  const leaves = [...SAMPLES.slice(0, Math.max(0, SAMPLES.length - real.length)), ...real];
  const n = leaves.length;
  document.getElementById("count").textContent = real.length;
  const K = Math.round(10 + (clumpEls.length - 10) * Math.min(1, n / 60));
  clumpEls.forEach((c, i) => c.classList.toggle("on", i < K));

  gT.replaceChildren();
  leaves.forEach((l, i) => {
    const s = slots[i % slots.length], lap = Math.floor(i / slots.length), feat = i % 4 === 0 || i >= n - 3;
    const o = el("g", { transform: `translate(${f(s.x + lap * 14)} ${f(s.y - s.L + lap * 10)})` });
    const mid = el("g", { class: !first && !seen.has(l.id) ? "drop" : "" });
    const sw = el("g", { class: "swing", style: `--d:${f(3 + s.r * 2.5)}s;--dl:-${f(s.r * 6)}s` });
    sw.append(el("line", { x1: 0, y1: 0, x2: 0, y2: s.L, stroke: "#7a5a38", "stroke-width": 1 }), el("circle", { r: 2.2, fill: "#7a5a38" }));
    const t = el("g", { class: "tag", transform: `translate(0 ${f(s.L)}) rotate(${f(s.rot)})`, tabindex: 0, role: "button", "aria-label": "Leaf: " + l.text });
    if (feat) {
      t.append(el("path", { d: TOOTH, transform: "translate(0 40)", fill: s.c, stroke: "#0002", "stroke-width": 1 }));
      const lines = wrap(l.text), tx = el("text", { "text-anchor": "middle", class: "tagtxt" });
      lines.forEach((ln, k) => { const sp = el("tspan", { x: 0, y: 40 + (k - (lines.length - 1) / 2) * 17 + 5 }); sp.textContent = ln; tx.append(sp); });
      t.append(tx);
    } else {
      t.append(el("path", { d: BLANK, transform: "translate(0 32)", fill: s.c, stroke: "#0002", "stroke-width": 1 }), el("path", { d: "M0,6 L0,60", stroke: "#0003", "stroke-width": 1 }));
    }
    t.onclick = () => show(l);
    t.onkeydown = e => { if (e.key === "Enter" || e.key === " ") show(l); };
    sw.append(t); mid.append(sw); o.append(mid); gT.append(o);
    seen.add(l.id);
  });
  first = false;

  wall.replaceChildren();
  [...leaves].reverse().forEach(l => {
    const li = document.createElement("li"), p = document.createElement("p"), sm = document.createElement("small");
    p.textContent = l.text; sm.textContent = l.sample ? "— example leaf" : l.name ? "— " + l.name : "— a resident";
    li.append(p, sm); wall.append(li);
  });
  if (!n) wall.innerHTML = "<li class='empty'>No leaves yet — be the first!</li>";
}

document.getElementById("demo").hidden = !DEMO;
const params = new URLSearchParams(location.search);
if (params.has("preview")) {
  const msgs = ["Finish the semester strong!", "Call my mom more", "Proud of you", "Get an A in calc", "Be kind to myself", "Thankful for my roommate", "Run a 5K", "You got this!", "Better days ahead", "Grateful for this community"];
  const n = +params.get("preview") || 70;
  render(Array.from({ length: n }, (_, i) => ({ id: "p" + i, text: msgs[i % msgs.length], name: i % 3 ? "" : "Alex", createdAt: Date.now() - i * 864e5 })));
} else subscribe(render);
