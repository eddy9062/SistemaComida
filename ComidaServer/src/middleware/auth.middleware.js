import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findActiveUserByUsername } from '../services/users.service.js';

export const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'authorization token invalido' });
  }

  const token = authorization.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await findActiveUserByUsername(payload.usuario);

    if (!user || user.password_hash !== payload.clave) {
      return res.status(403).json({ message: 'token invalido' });
    }

    req.user = {
      id_usuario: user.id_usuario,
      usuario: user.usuario,
      nombre: user.nombre,
      cod_role: user.cod_role
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'token invalido' });
  }
};
