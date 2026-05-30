const sequelize = require('../config/database');
const User = require('./User');
const Session = require('./Session');
const { Media, CATEGORIES } = require('./Media');
const Subscription = require('./Subscription');

User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Media, { foreignKey: 'userId', as: 'media' });
Media.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });

User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Session,
  Media,
  Subscription,
  CATEGORIES
};
