export async function sync(req, res) {
  const { uid, email, name, email_verified: emailVerified } = req.firebaseUser;
  const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN ?? '@unifor.br').toLowerCase();

  if (!email || !email.toLowerCase().endsWith(allowedDomain)) {
    // 403 = domínio não permitido (contrato API.md). Nada é gravado.
    return res.status(403).json({
      error: { code: 'DOMAIN_NOT_ALLOWED', message: 'Somente e-mail institucional @unifor.br.' },
    });
  }

  // TODO (Passo 5 da doc): upsert em users(firebaseUid) via Sequelize.
  // Até lá, respondemos com a identidade já validada.
  return res.status(200).json({
    data: { firebaseUid: uid, email, name: name ?? null, emailVerified: Boolean(emailVerified) },
  });
}

export async function me(req, res) {
  const { uid, email, name, email_verified: emailVerified } = req.firebaseUser;

  return res.status(200).json({
    data: { firebaseUid: uid, email, name: name ?? null, emailVerified: Boolean(emailVerified) },
  });
}