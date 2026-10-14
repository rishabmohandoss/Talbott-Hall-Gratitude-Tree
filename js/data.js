import { firebaseConfig } from "./config.js";

export const DEMO = !firebaseConfig;
const MAX_TEXT = 300, MAX_NAME = 40;
const FB = "https://www.gstatic.com/firebasejs/12.0.0/";
const AI_CAP = 100; // lifetime cap on photos sent to Gemini, so usage stays far inside any free quota

let fs, db, app;
async function init() {
  if (db) return;
  const a = await import(FB + "firebase-app.js");
  fs = await import(FB + "firebase-firestore.js");
  app = a.initializeApp(firebaseConfig);
  db = fs.getFirestore(app);
}

const demoRead = () => { try { return JSON.parse(localStorage.getItem("leaves-demo")) || []; } catch { return []; } };

// cb receives [{id, text, name, createdAt(ms)}] sorted oldest first, live-updated.
export async function subscribe(cb) {
  if (DEMO) {
    cb(demoRead());
    addEventListener("storage", () => cb(demoRead()));
    return;
  }
  await init();
  const q = fs.query(fs.collection(db, "leaves"), fs.orderBy("createdAt", "desc"), fs.limit(200));
  fs.onSnapshot(q, snap => cb(snap.docs.reverse().map(d => {
    const v = d.data();
    return { id: d.id, text: v.text, name: v.name || "", createdAt: v.createdAt ? v.createdAt.toMillis() : Date.now() };
  })));
}

export const NJIT_EMAIL = /^[a-z0-9._%+-]+@njit\.edu$/;

export async function addLeaf({ text, name, email }) {
  email = (email || "").trim().toLowerCase();
  if (!NJIT_EMAIL.test(email)) throw new Error("NJIT email required");
  text = text.trim().slice(0, MAX_TEXT);
  name = (name || "").trim().slice(0, MAX_NAME);
  if (!text) throw new Error("Leaf is empty");
  if (DEMO) {
    const all = demoRead();
    all.push({ id: "d" + Date.now(), text, name, createdAt: Date.now() });
    localStorage.setItem("leaves-demo", JSON.stringify(all));
    return;
  }
  await init();
  // The email goes in a separate write-only collection so it is never readable from the public site.
  const leaf = fs.doc(fs.collection(db, "leaves")), batch = fs.writeBatch(db);
  batch.set(leaf, { text, name, createdAt: fs.serverTimestamp() });
  batch.set(fs.doc(fs.collection(db, "submissions")), { email, leafId: leaf.id, createdAt: fs.serverTimestamp() });
  await batch.commit();
}
export { MAX_TEXT, MAX_NAME };

// Optional handwriting reader (Gemini via Firebase AI Logic). It only ever runs for the first AI_CAP photos
// and returns "" on ANY problem (not enabled, quota, offline, slow), so callers just fall back to the normal reader.
export async function aiRead(canvas) {
  if (DEMO) return "";
  try {
    await init();
    const ref = fs.doc(db, "meta", "ocr"), snap = await fs.getDoc(ref);
    if (snap.exists() && snap.data().count >= AI_CAP) return "";
    const ai = await import(FB + "firebase-ai.js");
    const model = ai.getGenerativeModel(ai.getAI(app, { backend: new ai.GoogleAIBackend() }), { model: "gemini-3.1-flash-lite" });
    const data = canvas.toDataURL("image/jpeg", .8).split(",")[1];
    const run = model.generateContent([
      "Transcribe the handwritten or printed message on this paper leaf exactly as written. The photo may be rotated. Reply with only the message text. If there is no readable message, reply NONE.",
      { inlineData: { mimeType: "image/jpeg", data } }
    ]);
    const res = await Promise.race([run, new Promise((_, no) => setTimeout(() => no(new Error("slow")), 12000))]);
    const t = res.response.text().trim();
    if (!t || /^none\.?$/i.test(t)) return "";
    // Count only reads that actually worked, so a disabled/failing AI never uses up the cap.
    fs.runTransaction(db, async tx => { const s = await tx.get(ref); tx.set(ref, { count: (s.exists() ? s.data().count : 0) + 1 }); }).catch(() => {});
    return t;
  } catch (e) { console.warn("AI reader skipped:", e && e.message); return ""; }
}
