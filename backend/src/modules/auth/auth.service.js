import {findByFirebaseUid,createUser,updateUser} from '../users/users.repository.js';

export async function syncFirebaseUser(firebaseUser) {
  const {uid,email,name,email_verified: emailVerified} = firebaseUser;

if (emailVerified !== true) {
  const error = new Error('Confirme seu e-mail institucional.');
  error.status = 403;
  error.code = 'EMAIL_NOT_VERIFIED';
  throw error;
}

  const allowedDomain = (
    process.env.ALLOWED_EMAIL_DOMAIN || '@edu.unifor.br'
  ).trim().toLowerCase();

  const normalizedEmail = email?.trim().toLowerCase() || '';

if (!normalizedEmail.endsWith(allowedDomain)) {
    const error = new Error('E-mail institucional obrigatório');
    error.status = 403;
    error.code = 'DOMAIN_NOT_ALLOWED';
    throw error;
  }

  // Preparar os dados do usuário
  const userData = {
    firebaseUid: uid,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split('@')[0]
  };

  // Procurar usuário existente
  const existingUser = await findByFirebaseUid(uid);

  // Se não existir, cadastrar
if (!existingUser) {
    return createUser(userData);
  }

  // Se existir, atualizar os dados
  return updateUser(existingUser, {
    email: userData.email,
    name: userData.name
  });
}



export async function getMyProfile(firebaseUser) {
  const allowedDomain = (
    process.env.ALLOWED_EMAIL_DOMAIN || '@unifor.br'
  ).trim().toLowerCase();

  const email = firebaseUser.email?.trim().toLowerCase() || '';

  if (!email.endsWith(allowedDomain)) {
    const error = new Error('E-mail institucional obrigatório');
    error.status = 403;
    error.code = 'DOMAIN_NOT_ALLOWED';
    throw error;
  }

  if (firebaseUser.email_verified !== true) {
    const error = new Error('Confirme seu e-mail institucional');
    error.status = 403;
    error.code = 'EMAIL_NOT_VERIFIED';
    throw error;
  }

  return findByFirebaseUid(firebaseUser.uid);
}

