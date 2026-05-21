import { asyncHandler } from '../utils/async-handler.js';
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser
} from '../services/users.service.js';

export const getUsuarios = asyncHandler(async (req, res) => {
  res.json(await listUsers());
});

export const getUsuario = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no existe' });
  }

  res.json(user);
});

export const createUsuario = asyncHandler(async (req, res) => {
  
  const user = await createUser(req.body);
  res.status(201).json(user);
});

export const updateUsuario = asyncHandler(async (req, res) => {
console.log(req.body)
  const user = await updateUser(req.params.id, req.body);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no existe' });
  }

  res.json(user);
});

export const deleteUsuario = asyncHandler(async (req, res) => {
  const deleted = await deleteUser(req.params.id);

  if (deleted <= 0) {
    return res.status(404).json({ message: 'Usuario no Existe' });
  }

  res.sendStatus(204);
});
