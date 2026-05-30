const express = require('express');
const { body, validationResult } = require('express-validator');
const { Subscription } = require('../models');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

router.post('/',
  authenticate,
  body('plan').isIn(['monthly', 'yearly', 'premium']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await Subscription.update(
        { isActive: false },
        { where: { userId: req.user.id, isActive: true } }
      );

      const planDurations = {
        monthly: 30 * 24 * 60 * 60 * 1000,
        yearly: 365 * 24 * 60 * 60 * 1000,
        premium: 365 * 24 * 60 * 60 * 1000
      };

      const subscription = await Subscription.create({
        userId: req.user.id,
        plan: req.body.plan,
        isActive: true,
        expiresAt: new Date(Date.now() + planDurations[req.body.plan])
      });

      res.status(201).json({
        message: 'Subscription created successfully',
        subscription
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  }
);

router.get('/', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: {
        userId: req.user.id,
        isActive: true,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      subscription,
      hasActiveSubscription: !!subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

router.delete('/', authenticate, async (req, res) => {
  try {
    await Subscription.update(
      { isActive: false },
      { where: { userId: req.user.id, isActive: true } }
    );

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;
