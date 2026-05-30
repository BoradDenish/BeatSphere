const express = require('express');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { uploadFile, uploadThumbnail } = require('../middleware/upload');
const youtubeService = require('../services/youtube');

const router = express.Router();

/**
 * Get info about a YouTube video before downloading
 */
router.post('/youtube/info', authenticate, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const info = await youtubeService.getInfo(url);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Download YouTube content and thumbnail
 */
router.post('/youtube/download', authenticate, async (req, res) => {
  try {
    const { url, mediaType } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    // 1. Get Info
    const info = await youtubeService.getInfo(url);
    
    // 2. Download Thumbnail
    const thumbnail = await youtubeService.downloadThumbnail(info.thumbnailUrl);
    
    // 3. Download Media
    const media = await youtubeService.downloadMedia(url, mediaType || 'audio');

    res.json({
      message: 'YouTube content imported successfully',
      title: info.title,
      description: info.description,
      duration: info.duration,
      mediaType: mediaType || 'audio',
      file: media,
      thumbnail: thumbnail
    });
  } catch (error) {
    console.error('YouTube import error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/file', authenticate, uploadFile, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = req.file.mimetype.startsWith('audio')
      ? `/uploads/music/${req.file.filename}`
      : `/uploads/videos/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.post('/thumbnail', authenticate, uploadThumbnail, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No thumbnail uploaded' });
    }

    res.json({
      message: 'Thumbnail uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: `/uploads/thumbnails/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Upload thumbnail error:', error);
    res.status(500).json({ error: 'Failed to upload thumbnail' });
  }
});

router.delete('/file/:filename', authenticate, (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    const musicPath = path.join(uploadsDir, 'music', filename);
    const videoPath = path.join(uploadsDir, 'videos', filename);
    const thumbPath = path.join(uploadsDir, 'thumbnails', filename);

    let filePath = null;
    if (fs.existsSync(musicPath)) filePath = musicPath;
    else if (fs.existsSync(videoPath)) filePath = videoPath;
    else if (fs.existsSync(thumbPath)) filePath = thumbPath;

    if (filePath) {
      fs.unlinkSync(filePath);
      return res.json({ message: 'File deleted successfully' });
    }

    res.status(404).json({ error: 'File not found' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
