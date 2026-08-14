/**
 * Firebase client SDK — inicialização centralizada.
 *
 * MOCK_MODE = true: app roda 100% com dados locais, sem conexão ao Firebase.
 * Para ativar Firebase real, mude MOCK_MODE para false.
 */

import { FirebaseApp } from "firebase/app"
import { Auth } from "firebase/auth"
import { Firestore } from "firebase/firestore"
import { FirebaseStorage } from "firebase/storage"

/**
 * MOCK MODE — quando true, ignora Firebase completamente.
 * Para conectar ao Firebase real, altere para: false
 */
export const MOCK_MODE = true

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

// Só inicializa Firebase se NÃO estiver em mock
if (!MOCK_MODE) {
  const { initializeApp, getApps } = require("firebase/app")
  const { getAuth } = require("firebase/auth")
  const { getFirestore } = require("firebase/firestore")
  const { getStorage } = require("firebase/storage")

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  }

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

export { app, auth, db, storage }
