const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../notewise.db'),
  logging: false
});

const User = sequelize.define('User', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const Note = sequelize.define('Note', {
  id: { type: DataTypes.STRING, primaryKey: true },
  user_id: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, defaultValue: 'Untitled Note' },
  content: { type: DataTypes.TEXT, defaultValue: '' },
  tags: { type: DataTypes.TEXT, defaultValue: '[]' },
  category: { type: DataTypes.STRING, defaultValue: 'General' },
  is_archived: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
  share_id: { type: DataTypes.STRING, allowNull: true },
  ai_summary: { type: DataTypes.TEXT, allowNull: true },
  ai_action_items: { type: DataTypes.TEXT, allowNull: true },
  ai_suggested_title: { type: DataTypes.STRING, allowNull: true },
  ai_calls: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const AiUsage = sequelize.define('AiUsage', {
  id: { type: DataTypes.STRING, primaryKey: true },
  user_id: { type: DataTypes.STRING, allowNull: false },
  note_id: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

User.hasMany(Note, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'user_id' });

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synced');
}).catch(err => console.error('DB sync error:', err));

module.exports = { sequelize, User, Note, AiUsage };