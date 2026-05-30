const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Subscription } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      attributes: { exclude: ['passwordHash'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{
        model: Subscription,
        as: 'subscriptions',
        limit: 1,
        order: [['created_at', 'DESC']]
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const mediaCount = await user.countMedia();

    res.json({
      ...user.toJSON(),
      mediaCount
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/:id',
  authenticate,
  requireAdmin,
  body('username').optional().trim().isLength({ min: 3, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'user']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { username, email, role, isActive } = req.body;
      const updates = {};

      if (username) updates.username = username;
      if (email) updates.email = email;
      if (role) updates.role = role;
      if (typeof isActive === 'boolean') updates.isActive = isActive;

      await user.update(updates);

      res.json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
