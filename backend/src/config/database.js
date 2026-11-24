import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

// Variáveis coladas à mão (Vercel) podem vir com espaços, quebras de linha,
// protocolo ou porta junto. Normalizamos para evitar ENOTFOUND/erros de login.
function env(name) {
  return process.env[name]?.trim();
}

function normalizeHost(value) {
  return String(value ?? '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '');
}

function parsePort(value) {
  const port = Number(String(value ?? '').trim());
  return Number.isInteger(port) && port > 0 ? port : 4000;
}

const dbHost = normalizeHost(process.env.DB_HOST);

export function dbHostInfo() {
  const raw = String(process.env.DB_HOST ?? '');
  const clean = raw.trim();
  const masked = clean.length > 16 ? `${clean.slice(0, 9)}...${clean.slice(-4)}` : clean;

  return {
    definido: raw.length > 0,
    tamanho: raw.length,
    hostMascarado: masked,
    temEspaco: /\s/.test(raw),
    temProtocolo: /^https?:\/\//i.test(clean),
    temPorta: /:\d+$/.test(clean),
    normalizado: dbHost,
  };
}

const dbSsl = env('DB_SSL') === 'true' ? { minVersion: 'TLSv1.2' } : undefined;

export const sequelize = new Sequelize(
  env('DB_NAME'),
  env('DB_USER'),
  env('DB_PASSWORD'),
  {
    host: dbHost,
    port: parsePort(process.env.DB_PORT),
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false,
    timezone: '+00:00',
    pool: { max: 3, min: 1, idle: 10000, acquire: 60000 },
    ...(dbSsl ? { dialectOptions: { ssl: dbSsl } } : {}),
  }
);
