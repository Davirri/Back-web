const errorHandler = (err, req, res, next) => {
  console.error(err); // Imprime el error en la consola para depuración

  // Verificamos el tipo de error y respondemos en consecuencia
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID de formato incorrecto' });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ error: err.message });
  }

  // Si es un error no específico, respondemos con un error 500
  res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
};

export default errorHandler;
