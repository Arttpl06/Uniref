import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

const dbSsl = process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2' } : undefined;

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false,
    timezone: '+00:00',
    pool: { max: 3, min: 1, idle: 10000, acquire: 60000 },
    ...(dbSsl ? { dialectOptions: { ssl: dbSsl } } : {}),
  }
);