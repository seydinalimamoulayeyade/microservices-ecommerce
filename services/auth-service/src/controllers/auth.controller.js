const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const signToken = (user) =>
  jwt.sign(
    { sub: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

// POST /register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new ApiError(400, 'username, email et password sont requis');
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      status: 'success',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ApiError(400, 'username et password sont requis');
    }

    // username peut être un nom d'utilisateur ou un email
    const user = await User.findOne({
      $or: [{ username }, { email: username.toLowerCase() }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Identifiants invalides');
    }

    const token = signToken(user);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /verify  (Authorization: Bearer <token>)
const verify = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Token manquant');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      throw new ApiError(401, 'Token invalide ou expiré');
    }

    res.status(200).json({
      status: 'success',
      data: {
        valid: true,
        user: { id: decoded.sub, username: decoded.username, role: decoded.role },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, verify };
