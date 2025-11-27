const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Recurso não encontrado';
    return res.status(404).json({ error: error.message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Valor duplicado encontrado';
    return res.status(400).json({ error: error.message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ error: message });
  }

  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro no servidor'
  });
};

module.exports = errorHandler;
