export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'end point not found' });
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: statusCode === 500 ? 'error en el Servidor' : error.message,
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
};
