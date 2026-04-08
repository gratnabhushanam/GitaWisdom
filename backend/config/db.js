const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const dialect = process.env.DB_DIALECT || 'sqlite';
const isSqlite = dialect === 'sqlite';
const useMongo = String(process.env.USE_MONGODB || 'false').toLowerCase() === 'true';
const mongoUri = String(process.env.MONGO_URI || '').trim();
const mongoRequired = String(process.env.MONGO_REQUIRED || 'false').toLowerCase() === 'true';
const sqlFallbackWhenMongo = String(process.env.SQL_FALLBACK_WHEN_MONGO || 'false').toLowerCase() === 'true';
const sqliteStorage = process.env.SQLITE_STORAGE || path.join(__dirname, '..', 'data', 'gita_wisdom.sqlite');
const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const isVercelRuntime = String(process.env.VERCEL || '').toLowerCase() === '1';
const allowProductionMock = String(process.env.ALLOW_PROD_MOCK || '').toLowerCase() === 'true' || isVercelRuntime;
const defaultAlterSchema = !isProduction && !isSqlite;
const shouldAlterSchema = String(process.env.DB_SYNC_ALTER || String(defaultAlterSchema)).toLowerCase() === 'true';

const createMockModel = (modelName) => {
  const unavailable = async () => {
    throw new Error(`${modelName} is unavailable in the Vercel mock runtime`);
  };

  return {
    findAll: unavailable,
    findOne: unavailable,
    findByPk: unavailable,
    create: unavailable,
    update: unavailable,
    destroy: unavailable,
    count: unavailable,
    belongsToMany: () => {},
    belongsTo: () => {},
    hasMany: () => {},
    hasOne: () => {},
    sync: async () => {},
  };
};

const createMockSequelize = () => {
  const models = new Map();

  return {
    define: (modelName) => {
      if (!models.has(modelName)) {
        models.set(modelName, createMockModel(modelName));
      }

      return models.get(modelName);
    },
    authenticate: async () => {},
    sync: async () => {},
    close: async () => {},
  };
};

const sequelize = isVercelRuntime
  ? createMockSequelize()
  : isSqlite
    ? new Sequelize({
        dialect: 'sqlite',
        storage: sqliteStorage,
        logging: false,
      })
    : new Sequelize(
        process.env.DB_NAME || 'gita_wisdom',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
          host: process.env.DB_HOST || 'localhost',
          dialect,
          logging: false,
        }
      );

const connectDB = async () => {
  if (isVercelRuntime) {
    console.log('Vercel runtime detected. Using mock database mode.');
    require('../controllers/authController').setMockMode(true);
    return;
  }

  let mongoConnected = false;
  if (useMongo) {
    if (!mongoUri) {
      const missingUriMessage = 'USE_MONGODB is true but MONGO_URI is missing.';
      if (mongoRequired) {
        throw new Error(missingUriMessage);
      }
      console.warn(`${missingUriMessage} Continuing with Sequelize database.`);
    } else {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
        console.log('MongoDB Connected using Mongoose');
        mongoConnected = true;
      } catch (mongoError) {
        const failureMessage = `Unable to connect to MongoDB: ${mongoError.message}`;
        if (mongoRequired) {
          throw new Error(failureMessage);
        }
        console.warn(`${failureMessage}. Continuing with Sequelize database.`);
      }
    }
  }

  if (useMongo && mongoConnected && !sqlFallbackWhenMongo) {
    console.log('SQL startup skipped because MongoDB is active (SQL_FALLBACK_WHEN_MONGO=false).');
    return;
  }

  try {
    await sequelize.authenticate();
    if (isSqlite) {
      console.log(`SQLite Connected using Sequelize (${sqliteStorage})`);
    } else {
      console.log(`${dialect.toUpperCase()} Connected using Sequelize`);
    }
    // Sync models
    if (shouldAlterSchema) {
      await sequelize.sync({ alter: true });
    } else {
      await sequelize.sync();
    }
    console.log('Database synced');
  } catch (error) {
    console.error('Unable to connect to the SQL database:', error.message);
    if (error && error.errors) {
      console.error('SQL validation details:', error.errors.map((item) => item.message));
    }
    if (isProduction && !allowProductionMock) {
      throw new Error('Database connection failed in production. Mock mode is disabled for security.');
    }
    console.warn('Running backend without a database. Using mock authentication/content fallback.');
    require('../controllers/authController').setMockMode(true);
  }
};

module.exports = { sequelize, connectDB };
