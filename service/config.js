
const dotenv = require("dotenv").config();

const { parsed } = dotenv;

const {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
  EMAIL,
  PASS,
  ACCESSKEY,
  SECRETACCESS
} = process.env;

const config = {
  MONGODB_URI: MONGODB_URI,
  PORT: PORT,
  JWT_SECRET: JWT_SECRET,
  EMAILID: EMAIL,
  PASS: PASS,
  ACCESSKEY:ACCESSKEY,
  SECRETACCESS:SECRETACCESS
};
module.exports = config;
