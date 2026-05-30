const express = require('express');
const { body, validationResult } = require('express-validator');
const { Media, User, Subscription, CATEGORIES } = require('../models');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth');
const { uploadFile, uploadThumbnail, uploadMediaWithThumbnail } = require('../middleware/upload');
const { Op } = require('sequelize');

const router = express.Router();

const FREE_PLAYS = 5;

router.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      type,
      search,
      category,
      premium,
      sort = 'created',
      userId 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};

    if (type) where.mediaType = type;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (premium !== undefined) where.isPremium = premium === 'true';
    if (userId) where.userId = parseInt(userId);

    let order;
    switch (sort) {
      case 'plays':
        order = [['plays', 'DESC']];
        break;
      case 'title':
        order = [['title', 'ASC']];
        break;
      default:
        order = [['created_at', 'DESC']];
    }

    const { count, rows: media } = await Media.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'username']
      }]
    });

    let freePlaysUsed = 0;
    if (!req.user) {
      freePlaysUsed = req.cookies?.freePlays ? parseInt(req.cookies.freePlays) : 0;
    }

    res.json({
      media,
      freePlaysRemaining: req.user ? null : Math.max(0, FREE_PLAYS - freePlaysUsed),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'username']
      }]
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    await media.increment('plays');

    const isOwner = req.user && req.user.id === media.userId;
    const isAdmin = req.user && req.user.role === 'admin';

    let hasAccess = isOwner || isAdmin;
    if (!hasAccess && req.user) {
      const subscription = await Subscription.findOne({
        where: {
          userId: req.user.id,
          isActive: true,
          expiresAt: { [Op.gt]: new Date() }
        }
      });
      hasAccess = !!subscription;
    }

    res.json({
      ...media.toJSON(),
      hasAccess,
      canPlay: hasAccess || media.isPremium === false
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
});

router.post('/import',
  authenticate,
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('fileUrl').notEmpty(),
  body('mediaType').isIn(['audio', 'video']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const media = await Media.create({
        title: req.body.title,
        description: req.body.description || null,
        category: req.body.category || null,
        fileUrl: req.body.fileUrl,
        thumbnailUrl: req.body.thumbnailUrl || null,
        mediaType: req.body.mediaType,
        userId: req.user.id,
        isPremium: req.body.isPremium === 'true' || req.body.isPremium === true,
        duration: req.body.duration ? parseInt(req.body.duration) : null,
        fileSize: req.body.fileSize ? parseInt(req.body.fileSize) : null,
        mimeType: req.body.mimeType || (req.body.mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4')
      });

      const fullMedia = await Media.findByPk(media.id, {
        include: [{
          model: User,
          as: 'uploader',
          attributes: ['id', 'username']
        }]
      });

      res.status(201).json({
        message: 'Media imported successfully',
        media: fullMedia
      });
    } catch (error) {
      console.error('Import media error:', error);
      res.status(500).json({ error: 'Failed to import media' });
    }
  }
);

router.post('/',
  authenticate,
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('mediaType').isIn(['audio', 'video']),
  body('category').optional().isIn(CATEGORIES),
  uploadMediaWithThumbnail,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.files || !req.files.file || req.files.file.length === 0) {
        return res.status(400).json({ error: 'File is required' });
      }

      const mediaFile = req.files.file[0];

      const userMediaCount = await Media.count({
        where: { userId: req.user.id }
      });

      const hasActiveSubscription = await Subscription.findOne({
        where: {
          userId: req.user.id,
          isActive: true,
          expiresAt: { [Op.gt]: new Date() }
        }
      });

      if (userMediaCount >= 10 && !hasActiveSubscription) {
        return res.status(403).json({ 
          error: 'Upload limit reached. Please subscribe to upload more.' 
        });
      }

      const fileUrl = `/uploads/${mediaFile.mimetype.startsWith('audio') ? 'music' : 'videos'}/${mediaFile.filename}`;
      
      let thumbnailUrl = null;
      if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
        thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
      }

      const media = await Media.create({
        title: req.body.title,
        description: req.body.description || null,
        category: req.body.category || null,
        fileUrl,
        thumbnailUrl,
        mediaType: req.body.mediaType,
        userId: req.user.id,
        isPremium: req.body.isPremium === 'true',
        duration: req.body.duration ? parseInt(req.body.duration) : null,
        fileSize: mediaFile.size,
        mimeType: mediaFile.mimetype
      });

      const fullMedia = await Media.findByPk(media.id, {
        include: [{
          model: User,
          as: 'uploader',
          attributes: ['id', 'username']
        }]
      });

      res.status(201).json({
        message: 'Media uploaded successfully',
        media: fullMedia
      });
    } catch (error) {
      console.error('Upload media error:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  }
);

router.put('/:id',
  authenticate,
  body('title').optional().trim().isLength({ max: 255 }),
  body('description').optional().trim(),
  uploadThumbnail,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const media = await Media.findByPk(req.params.id);
      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      const isOwner = req.user.id === media.userId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to update this media' });
      }

      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.isPremium !== undefined) updates.isPremium = req.body.isPremium === 'true';
      if (req.body.thumbnailUrl) updates.thumbnailUrl = req.body.thumbnailUrl;
      if (req.file) {
        updates.thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
      }

      await media.update(updates);

      const updatedMedia = await Media.findByPk(media.id, {
        include: [{
          model: User,
          as: 'uploader',
          attributes: ['id', 'username']
        }]
      });

      res.json({
        message: 'Media updated successfully',
        media: updatedMedia
      });
    } catch (error) {
      console.error('Update media error:', error);
      res.status(500).json({ error: 'Failed to update media' });
    }
  }
);

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const isOwner = req.user.id === media.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this media' });
    }

    await media.destroy();
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

router.post('/:id/increment-play', optionalAuth, async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    await media.increment('plays');

    res.json({ plays: media.plays + 1 });
  } catch (error) {
    console.error('Increment play error:', error);
    res.status(500).json({ error: 'Failed to increment play' });
  }
});

module.exports = router;
