const jwt = require('jsonwebtoken');

/**
 * Vérification JWT centralisée au niveau de la passerelle.
 * Le token est ensuite relayé tel quel vers le service en aval
 * (qui le re-vérifie — défense en profondeur).
 */
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Authentification requise' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ status: 'fail', message: 'Token invalide ou expiré' });
  }
};

module.exports = { requireAuth };
