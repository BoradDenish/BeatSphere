const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Session } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const parseDuration = (expiresIn) => {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1]);
  const unit = match[2];
  const units = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  return value * (units[unit] || 86400000);
};

router.post('/register',
  body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Username must be 3-100 characters'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      const existingUser = await User.findOne({
        where: { [require('sequelize').Op.or]: [{ username }, { email }] }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const passwordHash = await User.hashPassword(password);
      const user = await User.create({
        username,
        email,
        passwordHash,
        role: 'user'
      });

      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      const expiresAt = new Date(Date.now() + parseDuration(expiresIn));
      await Session.create({ userId: user.id, token, expiresAt });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

router.post('/login',
  body('username').notEmpty(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      const user = await User.findOne({
        where: { username }
      });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is disabled' });
      }

      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      const expiresAt = new Date(Date.now() + parseDuration(expiresIn));
      await Session.create({ userId: user.id, token, expiresAt });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

router.post('/logout', authenticate, async (req, res) => {
  try {
    await Session.destroy({ where: { token: req.token } });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { Subscription } = require('../models');
    const subscription = await Subscription.findOne({
      where: {
        userId: req.user.id,
        isActive: true,
        expiresAt: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt
      },
      subscription: subscription ? {
        plan: subscription.plan,
        expiresAt: subscription.expiresAt
      } : null
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;
