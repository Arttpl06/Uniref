import { firebaseAuth } from '../config/firebase.js';

export async function authenticateFirebase(req, res, next) {
  const header = req.get('Authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Token ausente ou malformado.' },
    });
  }

  try {
    // true -> revoga se o token foi invalidado (ex.: logout/atualização)
    req.firebaseUser = await firebaseAuth.verifyIdToken(token, true);
    return next();
  } catch {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Token inválido ou expirado.' },
    });
  }
}
