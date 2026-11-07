import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "@/config/serviceAccountKey.json";

const app = !getApps().length
    ? initializeApp({
          credential: cert({
              projectId: serviceAccount.project_id,
              clientEmail: serviceAccount.client_email,
              privateKey: serviceAccount.private_key,
          }),
      })
    : getApps()[0];

export const firebaseAdmin = app;
export const firebaseAdminAuth = getAuth(app);
export default app;
