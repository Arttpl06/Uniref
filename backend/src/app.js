import express from 'express';
import authRoutes from './modules/auth/routes.js';
import referencesRoutes from './modules/references/routes.js';
import citationsRoutes from './modules/citations/routes.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' })); 

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ data: { status: 'ok' } });
});

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/references', referencesRoutes);

app.use('/api/v1/citations', citationsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } });
});

app.use((_err, _req, res, _next) => {
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Falha interna.' } });
});

export default app;