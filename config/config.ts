import dotenv from 'dotenv';
dotenv.config();

interface DbConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: 'postgres';
}

interface Config {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
}

const config: Config = {
  development: {
    username: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    host: process.env.DB_HOST as string,
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    host: process.env.DB_HOST as string,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    host: process.env.DB_HOST as string,
    dialect: 'postgres',
  },
};

export default config;
