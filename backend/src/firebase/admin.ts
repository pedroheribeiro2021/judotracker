// backend/src/firebase/admin.ts
import admin from "firebase-admin";
import fs from "fs";

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
      serviceAccount = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", err);
      throw err;
    }
  } else if (rawB64) {
    try {
      const decoded = Buffer.from(rawB64, "base64").toString("utf8");
      serviceAccount = JSON.parse(decoded);
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
