import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const JWT_EXPIRES_IN = "24h";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export default {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  GEMINI_API_KEY,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,

  INFO_WEBHOOK: process.env.INFO_WEBHOOK,
  ERROR_WEBHOOK: process.env.ERROR_WEBHOOK,

  PORT: process.env.PORT || 3000,
};
