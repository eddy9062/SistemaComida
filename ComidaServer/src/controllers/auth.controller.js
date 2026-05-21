import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/async-handler.js';
import { findActiveUserByUsername } from '../services/users.service.js';

export const login = asyncHandler(async (req, res) => {
  const { usuario, password } = req.body;
  const user = await findActiveUserByUsername(usuario);

console.log(user)

  if (!user) {
    return res.status(404).json({ message: 'Usuario no existe' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return res.status(200).json({ message: 'fail' });
  }

  const token = jwt.sign(
    {
      cod_empresa: user.cod_empresa,
      usuario: user.usuario,
      clave: user.password_hash,
      groups: [String(user.cod_role)]
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  res.status(200).json({
    cod_empresa: user.cod_empresa,
    usuario: user.usuario,
    nombre: user.nombre,
    role: user.role,
    token
  });
});

export const tokenValido = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Ok', user: req.user });
});
