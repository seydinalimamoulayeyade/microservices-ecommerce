const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

/**
 * Vérifie le JWT (header Authorization: Bearer <token>) et attache req.user.
 * Le secret est partagé avec l'Auth Service (JWT_SECRET).
 */
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Authentification requise'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub, username: decoded.username, role: decoded.role };
    next();
  } catch (e) {
    next(new ApiError(401, 'Token invalide ou expiré'));
  }
};

/**
 * Restreint l'accès aux administrateurs (à utiliser après requireAuth).
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Accès réservé aux administrateurs'));
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
