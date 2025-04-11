import Constants from "./constants";
import dotenv from "dotenv";

export function validateEnv() {
  dotenv.config();
  const constants = Constants;
  let valid = true;
  for (const key in constants) {
    if (!process.env[key]) {
      console.error(`Environment variable ${key} is missing`);
      valid = false;
    }
  }

  return valid;
}
