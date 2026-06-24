// Gestionnaire d'erreurs global
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Identifiant invalide : ${err.value}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (statusCode >= 500) console.error('❌', err);

  res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
  });
};

module.exports = errorHandler;
