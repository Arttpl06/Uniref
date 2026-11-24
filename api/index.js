let app;
let initError;

try {
  const mod = await import('../backend/src/app.js');
  app = mod.default;
} catch (err) {
  initError = err;
}

export default async function handler(req, res) {
  if (initError) {
    console.error('Erro ao inicializar o servidor:', initError);
    return res.status(500).json({
      error: {
        code: 'INIT_ERROR',
        message: initError.message || 'Erro ao inicializar o servidor.',
      },
    });
  }

  return app(req, res);
}
