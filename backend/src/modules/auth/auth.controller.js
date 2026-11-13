import {syncFirebaseUser,getMyProfile} from './auth.service.js';

export async function sync(req, res) {
  try {
    const user = await syncFirebaseUser(req.firebaseUser);

    return res.status(200).json({
      data: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        emailVerified: true
      }
    });

  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: {
          code: 'EMAIL_CONFLICT',
          message: 'E-mail já associado a outro usuário.'
        }
      });
    }

    console.error('Erro ao sincronizar usuário:', error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Falha interna.'
      }
    });
  }
}


export async function me(req, res) {
  try {
    const user = await getMyProfile(req.firebaseUser);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado. Sincronize sua conta.'
        }
      });
    }

    return res.status(200).json({
      data: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        emailVerified: true
      }
    });

  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    console.error('Erro ao consultar perfil:', error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Erro ao consultar usuário.'
      }
    });
  }
}

