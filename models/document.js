const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");

class Document extends Model {}

Document.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  document_type: {
    type: DataTypes.STRING(64),
    allowNull: false,
    defaultValue: ''
  },
  issue_date: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  expiry_date: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  document_number: {
    type: DataTypes.STRING(128),
    defaultValue: null,
    unique: 'idx_document_number'
  },
  file_reference: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: '{}',
    comment: "S3 object url or identifier"
  },
  encryption_key: {
    type: DataTypes.STRING(128),
    allowNull: false,
    defaultValue: '',
    comment: "key for file encryption/decryption"
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: null,
    onUpdate: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Document',
  tableName: 'document',
  timestamps: false, // Manually specifying created_at and updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  engine: 'InnoDB',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: 'document entity',
  indexes: [
    { unique: true, fields: ['document_number'], name: 'idx_document_number' },
    { fields: ['user_id'], name: 'idx_user_id' }
  ]
});

module.exports = Document;
