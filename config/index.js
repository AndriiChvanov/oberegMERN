const dotenv = require("dotenv-safe");

dotenv.config({
  allowEmptyValues: true,
});

const {
  PORT,
  SERVER_HOST,
  DATABASE_URL,
  MONGO_URI,
  JWT_SECRET,
  JWT_SECRET_RESET,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} = process.env;

module.exports = {
  PORT,
  SERVER_HOST,
  DATABASE_URL,
  MONGO_URI,
  JWT_SECRET,
  JWT_SECRET_RESET,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
};
