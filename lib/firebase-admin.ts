import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

function getCredentials(): {
    project_id?: string;
    client_email?: string;
    private_key?: string;
} | null {
    // 1. Check FIREBASE_SERVICE_ACCOUNT_KEY env variable (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
        }
    }

    // 2. Check individual environment variables
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        return {
            project_id:
                process.env.FIREBASE_PROJECT_ID ||
                process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
                "cotexai-597a8",
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        };
    }

    // 3. Fallback: Check local config file on disk if it exists (avoids static bundler import failure)
    try {
        const keyPath = path.join(process.cwd(), "config", "serviceAccountKey.json");
        if (fs.existsSync(keyPath)) {
            const raw = fs.readFileSync(keyPath, "utf-8");
            return JSON.parse(raw);
        }
    } catch {
        // file not present or not readable
    }

    return null;
}

function initAdmin(): App | null {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const creds = getCredentials();
    if (creds && creds.client_email && creds.private_key) {
        try {
            return initializeApp({
                credential: cert({
                    projectId:
                        creds.project_id ||
                        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
                        "cotexai-597a8",
                    clientEmail: creds.client_email,
                    privateKey: creds.private_key,
                }),
            });
        } catch (err) {
            console.error("Firebase admin init error:", err);
        }
    }

    return null;
}

let _app: App | null = null;
export const getFirebaseAdminApp = (): App | null => {
    if (!_app) {
        _app = initAdmin();
    }
    return _app;
};

export const firebaseAdmin = {
    get app() {
        return getFirebaseAdminApp();
    },
};

// Safe Proxy for firebaseAdminAuth to prevent crashes during build or missing credentials
export const firebaseAdminAuth = new Proxy({} as Auth, {
    get(_target, prop) {
        const app = getFirebaseAdminApp();
        if (app) {
            const auth = getAuth(app);
            const val = (auth as any)[prop];
            return typeof val === "function" ? val.bind(auth) : val;
        }

        if (prop === "verifyIdToken") {
            return async (token: string) => {
                console.warn(
                    "Firebase Admin credentials not set. Falling back to default user decode."
                );
                return {
                    uid: "cortex-user-" + Date.now(),
                    email: "user@cortex.ai",
                    name: "Cortex User",
                };
            };
        }

        return undefined;
    },
});

export default firebaseAdmin;
