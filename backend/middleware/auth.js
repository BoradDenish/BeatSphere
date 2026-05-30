const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const session = await Session.findOne({
      where: { userId: user.id, token }
    });

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ error: 'Token expired' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }
    next();
  } catch (error) {
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requirePremium = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { Subscription } = require('../models');
  const subscription = await Subscription.findOne({
    where: {
      userId: req.user.id,
      isActive: true,
      expiresAt: { [require('sequelize').Op.gt]: new Date() }
    }
  });

  req.hasPremium = !!subscription;
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin, requirePremium };
