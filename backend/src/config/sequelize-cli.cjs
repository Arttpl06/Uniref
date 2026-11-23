require('dotenv').config();

const dbSsl = process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2' } : undefined;

module.exports = {
    development:{
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: 'mysql',
        timezone: '+00:00',
        logging: false,
        ...(dbSsl ? { dialectOptions: { ssl: dbSsl } } : {})
    }
};