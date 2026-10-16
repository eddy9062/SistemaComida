export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'end point not found' });
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : (error.statusCode || 500);

  res.status(statusCode).json({
    message: statusCode === 413 ? 'La imagen supera el tamaño máximo permitido.' : (statusCode === 500 ? 'error en el Servidor' : error.message),
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
};
