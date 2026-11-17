// Domínios institucionais permitidos, configurados em ALLOWED_EMAIL_DOMAINS
// como uma lista separada por vírgula (ex.: "@edu.unifor.br,@unifor.br").
// A lista é validada no carregamento do módulo: sem configuração válida, o
// backend não inicia.

function normalizeDomain(value) {
  const domain = value.trim().toLowerCase();
  if (!domain) return null;
  return domain.startsWith('@') ? domain : `@${domain}`;
}

export function parseAllowedEmailDomains(raw) {
  const domains = [
    ...new Set(
      String(raw ?? '')
        .split(',')
        .map(normalizeDomain)
        .filter(Boolean)
    ),
  ];

  if (domains.length === 0) {
    throw new Error(
      'ALLOWED_EMAIL_DOMAINS ausente: defina ao menos um domínio em backend/.env (ex.: @edu.unifor.br,@unifor.br).'
    );
  }

  return Object.freeze(domains);
}

export const allowedEmailDomains = parseAllowedEmailDomains(
  process.env.ALLOWED_EMAIL_DOMAINS
);

// Compara o domínio exato (não usa sufixo): subdomínios e domínios parecidos
// só são aceitos se estiverem explicitamente na lista.

export function isAllowedEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');

  // O e-mail precisa ter exatamente um @
  if (
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1] ||
    /\s/.test(normalized)
  ) {
    return false;
  }

  return allowedEmailDomains.includes(`@${parts[1]}`);
}

