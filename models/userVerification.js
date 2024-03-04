const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

class UserVerification extends Model {}

UserVerification.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  document_list: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: sequelize.literal('(JSON_ARRAY())'),
    comment: 'list of document.id'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '0: unverified, 1: pending, 2: failed, 3: passed'
  },
  status_message: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '',
    comment: 'detailed description of status'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
  }
}, {
  sequelize,
  modelName: 'UserVerification',
  tableName: 'user_verification',
  timestamps: false, // Manually specifying created_at and updated_at
  engine: 'InnoDB',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: "User verification status",
  indexes: [
    { name: 'idx_user_id', fields: ['user_id'] },
    { name: 'idx_created_at', fields: ['created_at'] },
    { name: 'idx_status', fields: ['status'] }
  ]
});

module.exports = UserVerification;
