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

export async function addLeaf({ text, name }) {
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
  await fs.addDoc(fs.collection(db, "leaves"), { text, name, createdAt: fs.serverTimestamp() });
}
export { MAX_TEXT, MAX_NAME };
