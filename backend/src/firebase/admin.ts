// backend/src/firebase/admin.ts
import admin from "firebase-admin";

function parseServiceAccountFromEnv(value: string, label: string) {
  const trimmed = value.trim();

  // Caso comum em providers: colar o JSON diretamente na env var
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  // Caso base64 (ou base64url) do JSON
  const normalizedB64 = trimmed.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const decoded = Buffer.from(normalizedB64, "base64").toString("utf8").trim();

  if (!decoded.startsWith("{")) {
    throw new Error(
      `${label} does not look like JSON (direct) or base64(JSON). ` +
        `Decoded value starts with: ${JSON.stringify(decoded.slice(0, 20))}`
    );
  }

  return JSON.parse(decoded);
}

function initFirebaseAdmin() {
  // Se GOOGLE_APPLICATION_CREDENTIALS estiver definido, o admin SDK o usará automaticamente.
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      // apenas inicializa se ainda não inicializado
      if (!admin.apps.length) {
        admin.initializeApp();
        console.log(
          "firebase-admin initialized via GOOGLE_APPLICATION_CREDENTIALS"
        );
      }
      return admin;
    } catch (err) {
      console.error(
        "Error initializing firebase-admin via GOOGLE_APPLICATION_CREDENTIALS",
        err
      );
      throw err;
    }
  }

  // Caso contrário, tente ler FIREBASE_SERVICE_ACCOUNT (JSON) ou base64
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const rawB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

  let serviceAccount: any = null;

  if (raw) {
    try {
      serviceAccount =
        typeof raw === "string"
          ? parseServiceAccountFromEnv(raw, "FIREBASE_SERVICE_ACCOUNT")
          : raw;
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", err);
      throw err;
    }
  } else if (rawB64) {
    try {
      serviceAccount = parseServiceAccountFromEnv(
        rawB64,
        "FIREBASE_SERVICE_ACCOUNT_B64"
      );
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_B64:", err);
      throw err;
    }
  }

  if (!serviceAccount) {
    console.warn(
      "No Firebase service account provided in environment. firebase-admin not initialized."
    );
    return admin; // ainda retorna admin, mas sem apps inicializados
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("firebase-admin initialized via FIREBASE_SERVICE_ACCOUNT");
  }

  return admin;
}

export default initFirebaseAdmin();
