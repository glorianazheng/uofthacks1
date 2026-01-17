import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/betting_app.db',
  logging: false, // Set to console.log to see SQL queries
});

// ============================================
// USER MODEL
// ============================================
const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  emoji: {
    type: Sequelize.STRING(10),
    allowNull: false,
  },
  wins: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  losses: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  streak: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    comment: 'Positive for win streak, negative for loss streak',
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

// ============================================
// GROUP MODEL
// ============================================
const Group = sequelize.define('Group', {
  id: {
    type: Sequelize.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  inviteCode: {
    type: Sequelize.STRING(6),
    allowNull: false,
    unique: true,
  },
  description: {
    type: Sequelize.STRING(500),
    allowNull: true,
  },
  createdBy: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'groups',
  timestamps: true,
});

// ============================================
// GROUP MEMBERSHIP MODEL
// ============================================
const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: Sequelize.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  groupId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id',
    },
  },
  joinedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'group_members',
  timestamps: false,
});

// ============================================
// BET MODEL
// ============================================
const Bet = sequelize.define('Bet', {
  id: {
    type: Sequelize.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  groupId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id',
    },
  },
  title: {
    type: Sequelize.STRING(200),
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  category: {
    type: Sequelize.ENUM('sports', 'entertainment', 'weather', 'custom'),
    defaultValue: 'custom',
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('open', 'locked', 'resolved', 'completed'),
    defaultValue: 'open',
    allowNull: false,
  },
  createdBy: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  deadline: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  stake: {
    type: Sequelize.STRING(200),
    allowNull: false,
    comment: 'Consequence/stake description',
  },
  winningOutcomeId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  resolvedAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  resolvedBy: {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'bets',
  timestamps: true,
});

// ============================================
// OUTCOME MODEL (for a bet's possible outcomes)
// ============================================
const Outcome = sequelize.define('Outcome', {
  id: {
    type: Sequelize.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  betId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'bets',
      key: 'id',
    },
  },
  label: {
    type: Sequelize.STRING(200),
    allowNull: false,
  },
  weight: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
    comment: 'For weighted odds (1-10)',
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'outcomes',
  timestamps: false,
});

// ============================================
// ENTRY MODEL (user's bet pick)
// ============================================
const Entry = sequelize.define('Entry', {
  id: {
    type: Sequelize.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  betId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'bets',
      key: 'id',
    },
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  outcomeId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'outcomes',
      key: 'id',
    },
  },
  confidence: {
    type: Sequelize.INTEGER,
    defaultValue: 50,
    validate: {
      min: 1,
      max: 100,
    },
    comment: 'User confidence level (1-100%)',
  },
  result: {
    type: Sequelize.ENUM('pending', 'win', 'loss'),
    defaultValue: 'pending',
  },
  completedAt: {
    type: Sequelize.DATE,
    allowNull: true,
    comment: 'When user marked consequence as complete',
  },
  proofUrl: {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'URL to proof of completed consequence',
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'entries',
  timestamps: true,
});

// ============================================
// ASSOCIATIONS
// ============================================

// User - Group relationships
User.hasMany(Group, { foreignKey: 'createdBy', as: 'createdGroups' });
Group.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User - Group many-to-many through GroupMember
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId', otherKey: 'groupId', as: 'groups' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', otherKey: 'userId', as: 'members' });

// User - GroupMember relationships
User.hasMany(GroupMember, { foreignKey: 'userId', as: 'groupMemberships' });
GroupMember.belongsTo(User, { foreignKey: 'userId' });

// Group - GroupMember relationships
Group.hasMany(GroupMember, { foreignKey: 'groupId', as: 'groupMembers' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

// User - Bet relationships
User.hasMany(Bet, { foreignKey: 'createdBy', as: 'createdBets' });
Bet.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Group - Bet relationships
Group.hasMany(Bet, { foreignKey: 'groupId', as: 'bets' });
Bet.belongsTo(Group, { foreignKey: 'groupId' });

// Bet - Outcome relationships
Bet.hasMany(Outcome, { foreignKey: 'betId', as: 'outcomes' });
Outcome.belongsTo(Bet, { foreignKey: 'betId' });

// Bet - Entry relationships
Bet.hasMany(Entry, { foreignKey: 'betId', as: 'entries' });
Entry.belongsTo(Bet, { foreignKey: 'betId' });

// User - Entry relationships
User.hasMany(Entry, { foreignKey: 'userId', as: 'entries' });
Entry.belongsTo(User, { foreignKey: 'userId' });

// Outcome - Entry relationships
Outcome.hasMany(Entry, { foreignKey: 'outcomeId', as: 'entries' });
Entry.belongsTo(Outcome, { foreignKey: 'outcomeId' });

// ============================================
// DATABASE INITIALIZATION
// ============================================

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    await sequelize.sync({ alter: false });
    console.log('✅ Models synchronized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export { sequelize, User, Group, GroupMember, Bet, Outcome, Entry };
