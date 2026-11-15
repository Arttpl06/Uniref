import test from "node:test";
import assert from "node:assert/strict";

// O módulo valida a configuração no carregamento, então defina a lista antes
// de importá-lo.
process.env.ALLOWED_EMAIL_DOMAINS = "@edu.unifor.br,@unifor.br";

const {
  allowedEmailDomains,
  isAllowedEmail,
  parseAllowedEmailDomains,
} = await import("../src/config/emailDomains.js");

test("normaliza, remove espaços e duplicados", () => {
  assert.deepEqual(
    parseAllowedEmailDomains(" @EDU.UNIFOR.BR , unifor.br , @edu.unifor.br "),
    ["@edu.unifor.br", "@unifor.br"]
  );
});

test("aceita os dois domínios configurados", () => {
  assert.deepEqual(allowedEmailDomains, ["@edu.unifor.br", "@unifor.br"]);
  assert.equal(isAllowedEmail("aluno@edu.unifor.br"), true);
  assert.equal(isAllowedEmail("professor@unifor.br"), true);
  assert.equal(isAllowedEmail("  Professor@UNIFOR.BR  "), true);
});

test("rejeita domínios parecidos e subdomínios não listados", () => {
  assert.equal(isAllowedEmail("aluno@gmail.com"), false);
  assert.equal(isAllowedEmail("aluno@notunifor.br"), false);
  assert.equal(isAllowedEmail("aluno@sub.edu.unifor.br"), false);
  assert.equal(isAllowedEmail("aluno@edu.unifor.br.evil.com"), false);
});

test("rejeita e-mail malformado", () => {
  assert.equal(isAllowedEmail(""), false);
  assert.equal(isAllowedEmail(null), false);
  assert.equal(isAllowedEmail("semarroba"), false);
  assert.equal(isAllowedEmail("@unifor.br"), false);
  assert.equal(isAllowedEmail("aluno@"), false);
});

test("falha quando a lista está ausente ou vazia", () => {
  assert.throws(
    () => parseAllowedEmailDomains("  ,  "),
    /ALLOWED_EMAIL_DOMAINS/
  );
  assert.throws(
    () => parseAllowedEmailDomains(undefined),
    /ALLOWED_EMAIL_DOMAINS/
  );
});
