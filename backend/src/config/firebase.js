import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { resolve } from 'node:path';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson && !serviceAccountPath) {
  throw new Error('Defina FIREBASE_SERVICE_ACCOUNT_JSON (produção) ou FIREBASE_SERVICE_ACCOUNT (caminho do JSON, uso local).');
}

const app = getApps()[0] ?? initializeApp({
  credential: serviceAccountJson
    ? cert(JSON.parse(serviceAccountJson))
    : cert(resolve(process.cwd(), serviceAccountPath)),
});

export const firebaseAuth = getAuth(app);