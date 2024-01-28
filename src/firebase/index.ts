import admin from "firebase-admin";
import { config } from "../config";

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(config.firebase.key),
});

export const adminFirestore = firebaseApp.firestore();