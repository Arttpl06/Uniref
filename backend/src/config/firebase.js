import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { resolve } from 'node:path';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT ausente: informe o caminho do JSON da service account em backend/.env');
}


const app = getApps()[0] ?? initializeApp({
  credential: cert(resolve(process.cwd(), serviceAccountPath)),
});

export const firebaseAuth = getAuth(app);