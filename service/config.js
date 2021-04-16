const dotenv = require("dotenv").config();

const { parsed } = dotenv;

const {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
} = process.env;

const config = {
  MONGODB_URI: MONGODB_URI,
  PORT: PORT,
  JWT_SECRET: JWT_SECRET,
  DEV_ENV: false,
};
module.exports = config;
