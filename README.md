# Talbott Hall Gratitude Tree

Residents write on a paper maple leaf, scan a QR code, snap a photo, fix the OCR'd text, and a leaf appears on a live, growing tree. 100% free: GitHub Pages + Firebase Spark plan (Firestore only, no Storage) + in-browser OCR (Tesseract.js). Photos never leave the phone; only the text is saved.

## Go live
1. **Firebase**: console.firebase.google.com > new project > Build > Firestore Database > create (production mode) > Rules tab > paste `firestore.rules` > Publish.
2. Project settings > Your apps > Web (`</>`) > copy config into `js/config.js`.
3. **GitHub**: create a repo, push, then Settings > Pages > Deploy from branch `main` / root.
4. Open `https://<user>.github.io/<repo>/qr.html`, print the QR code, put it by the leaves.

Moderation: delete any leaf from the Firestore console (`leaves` collection).
