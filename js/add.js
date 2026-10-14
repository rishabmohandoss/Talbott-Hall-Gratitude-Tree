import { addLeaf, MAX_TEXT, MAX_NAME, DEMO, NJIT_EMAIL } from "./data.js";

const $ = id => document.getElementById(id);
const steps = { pick: $("s-pick"), read: $("s-read"), edit: $("s-edit"), done: $("s-done") };
const go = k => Object.entries(steps).forEach(([n, e]) => e.hidden = n !== k);
$("demo").hidden = !DEMO;
$("text").maxLength = MAX_TEXT; $("name").maxLength = MAX_NAME;

// Downscale + grayscale + contrast stretch: helps Tesseract on phone photos.
function prep(img) {
  const scale = Math.min(1, 1800 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  const x = c.getContext("2d"); x.drawImage(img, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  let lo = 255, hi = 0;
  for (let i = 0; i < p.length; i += 4) { const g = .3 * p[i] + .59 * p[i + 1] + .11 * p[i + 2]; p[i] = g; if (g < lo) lo = g; if (g > hi) hi = g; }
  const k = 255 / Math.max(1, hi - lo);
  for (let i = 0; i < p.length; i += 4) { const g = Math.max(0, Math.min(255, (p[i] - lo) * k)); p[i] = p[i + 1] = p[i + 2] = g; }
  x.putImageData(d, 0, 0);
  return c;
}

const rotate = (src, deg) => {
  if (!deg) return src;
  const c = document.createElement("canvas"), swap = deg % 180;
  c.width = swap ? src.height : src.width; c.height = swap ? src.width : src.height;
  const x = c.getContext("2d"); x.translate(c.width / 2, c.height / 2); x.rotate(deg * Math.PI / 180); x.drawImage(src, -src.width / 2, -src.height / 2);
  return c;
};

async function scan(file) {
  go("read");
  $("preview").src = URL.createObjectURL(file);
  $("note").textContent = "";
  let text = "";
  try {
    const img = await createImageBitmap(file);
    const canvas = prep(img);
    if (!window.Tesseract) await new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
      s.onload = ok; s.onerror = no; document.head.append(s);
    });
    const worker = await Tesseract.createWorker("eng");
    await worker.setParameters({ tessedit_pageseg_mode: "6" });
    // People hold the paper any which way: try every orientation, keep the one it is most sure about.
    let best = { score: 0, text: "" };
    const turns = [0, 90, 270, 180];
    for (let i = 0; i < turns.length; i++) {
      $("pct").textContent = `Reading… ${i + 1}/${turns.length}`;
      const { data } = await worker.recognize(rotate(canvas, turns[i]));
      const good = (data.words || []).filter(w => w.confidence >= 60 && /[A-Za-z0-9]/.test(w.text));
      const score = good.reduce((s, w) => s + w.confidence * w.text.length, 0);
      if (score > best.score) best = { score, text: good.map(w => w.text).join(" ") };
      if (good.length >= 2 && score > 400) break;
    }
    await worker.terminate();
    if (best.score < 250) best.text = "";
    text = best.text.replace(/[|_~^<>{}\[\]\\]/g, "").trim();
  } catch (e) { console.error(e); }
  $("note").textContent = text
    ? "Here's what we read. Fix anything that's off:"
    : "We couldn't read the handwriting (that's normal!) — just type your leaf below.";
  $("text").value = text.slice(0, MAX_TEXT);
  upd(); go("edit");
}

const upd = () => $("len").textContent = $("text").value.length + "/" + MAX_TEXT;
$("text").oninput = upd;
$("email").oninput = () => $("email").setCustomValidity("");
for (const id of ["cam", "file"]) $(id).onchange = e => e.target.files[0] && scan(e.target.files[0]);
$("typeonly").onclick = () => { $("preview").removeAttribute("src"); $("note").textContent = "Type what's on your leaf:"; $("text").value = ""; upd(); go("edit"); };
$("retry").onclick = () => { $("cam").value = $("file").value = ""; go("pick"); };

$("form").onsubmit = async e => {
  e.preventDefault();
  const em = $("email").value.trim().toLowerCase();
  if (!NJIT_EMAIL.test(em)) { $("email").setCustomValidity("Please use your @njit.edu email"); $("email").reportValidity(); return; }
  const b = $("send"); b.disabled = true; b.textContent = "Hanging your leaf…";
  try { await addLeaf({ text: $("text").value, name: $("anon").checked ? "" : $("name").value, email: em }); go("done"); }
  catch (err) { console.error(err); alert("Something went wrong — please try again."); }
  b.disabled = false; b.textContent = "Add my leaf to the tree 🍁";
};
$("again").onclick = () => { $("cam").value = $("file").value = ""; $("name").value = ""; go("pick"); };
