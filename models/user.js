const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/sequelize"); // Adjust the path as necessary

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  cognito_id: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  info_verification_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '0: info incomplete, 1: complete'
  },
  first_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  last_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  gender: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '0: male, 1: female, 2: other'
  },
  user_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Login name required by cognito'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '',
    unique: true
  },
  phone_verified: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
    comment: 'phone verification status, 0: not verified, 1: verified'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '',
    unique: true
  },
  email_verified: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
    comment: 'email verification status, 0: not verified, 1: verified'
  },
  birthday: {
    type: DataTypes.DATEONLY,
    defaultValue: null
  },
  residential_address: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: '{}'
  },
  emergency_contacts: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: '{}'
  },
  language_preference: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'English'
  },
  rewards_point: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rewards_tier: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  security_questions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: '{}'
  },
  preferred_contact: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Email'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'user',
  timestamps: true, // Set to true if you want Sequelize to handle createdAt and updatedAt
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  engine: 'InnoDB',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: "user",
  indexes: [
    { unique: true, fields: ['phone'] },
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['cognito_id'] },
    { fields: ['country'] },
    { fields: ['birthday'] },
    { fields: ['cognito_id'] }
  ]
});

module.exports = User;
