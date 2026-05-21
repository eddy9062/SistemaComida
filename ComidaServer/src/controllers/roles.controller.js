import { asyncHandler } from '../utils/async-handler.js';
import {
  createRoleRecord,
  deleteRoleRecord,
  getRoleById,
  listRoles,
  updateRoleRecord
} from '../services/roles.service.js';

export const getRoles = asyncHandler(async (req, res) => {
  res.json(await listRoles());
});

export const getRole = asyncHandler(async (req, res) => {
  const role = await getRoleById(req.params.id);

  if (!role) {
    return res.status(404).json({ message: 'Role no existe' });
  }

  res.json(role);
});

export const createRole = asyncHandler(async (req, res) => {
  const role = await createRoleRecord(req.body);
  res.status(201).json(role);
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await updateRoleRecord(req.params.id, req.body);

  if (!role) {
    return res.status(404).json({ message: 'Role no existe' });
  }

  res.json(role);
});

export const deleteRole = asyncHandler(async (req, res) => {
  const deleted = await deleteRoleRecord(req.params.id);

  if (deleted <= 0) {
    return res.status(404).json({ message: 'Role no Existe' });
  }

  res.sendStatus(204);
});
