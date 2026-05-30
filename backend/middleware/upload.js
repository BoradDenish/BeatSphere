const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const uploadsDir = path.join(__dirname, '..', 'uploads');
const musicDir = path.join(uploadsDir, 'music');
const videosDir = path.join(uploadsDir, 'videos');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

ensureDir(uploadsDir);
ensureDir(musicDir);
ensureDir(videosDir);
ensureDir(thumbnailsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadsDir;
    if (file.fieldname === 'thumbnail' || file.mimetype.startsWith('image')) {
      folder = thumbnailsDir;
    } else if (file.mimetype.startsWith('audio')) {
      folder = musicDir;
    } else if (file.mimetype.startsWith('video')) {
      folder = videosDir;
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/x-m4a'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-msvideo', 'video/x-matroska', 'video/quicktime'];
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    if (allowedImageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`Invalid thumbnail type: ${file.mimetype}`), false);
  }

  if (file.fieldname === 'file') {
    if (allowedAudioTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`Invalid media type: ${file.mimetype}`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_VIDEO_SIZE) || 524288000
  }
});

const uploadMiddleware = {
  uploadFile: upload.single('file'),
  uploadThumbnail: upload.single('thumbnail'),
  uploadMediaWithThumbnail: upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ])
};

module.exports = uploadMiddleware;
