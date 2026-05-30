const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CATEGORIES = [
  'Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'Electronic',
  'R&B', 'Country', 'Indie', 'Latin', 'Metal', 'Lo-Fi',
  'Blues', 'Reggae', 'Folk', 'Soul', 'K-Pop', 'Ambient',
  'Techno', 'Gospel', 'World', 'Acoustic', 'Funk', 'Punk'
];

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url'
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'thumbnail_url'
  },
  mediaType: {
    type: DataTypes.ENUM('audio', 'video'),
    allowNull: false,
    field: 'media_type'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: { model: 'users', key: 'id' }
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium'
  },
  plays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'File size in bytes'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'mime_type'
  }
}, {
  tableName: 'media',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = { Media, CATEGORIES };
