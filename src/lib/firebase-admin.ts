import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();
  // The Vercel env var was set from a dotenv-quoted line, so its value carries literal
  // wrapping double quotes and "\n" escapes rather than real newlines -- both need undoing
  // before the PEM key is parseable.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export const adminAuth = getAuth(getAdminApp());
