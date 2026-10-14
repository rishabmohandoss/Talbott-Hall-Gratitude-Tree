import { firebaseConfig } from "./config.js";

export const DEMO = !firebaseConfig;
const MAX_TEXT = 300, MAX_NAME = 40;
const FB = "https://www.gstatic.com/firebasejs/10.14.1/";

let fs, db;
async function init() {
  if (db) return;
  const app = await import(FB + "firebase-app.js");
  fs = await import(FB + "firebase-firestore.js");
  db = fs.getFirestore(app.initializeApp(firebaseConfig));
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
  const q = fs.query(fs.collection(db, "leaves"), fs.orderBy("createdAt", "asc"));
  fs.onSnapshot(q, snap => cb(snap.docs.map(d => {
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
