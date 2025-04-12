import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

// Salt rounds for password hashing
const SALT_ROUNDS = 10;

/**
 * Generate a random UUID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Generate a random date between start and end date
 */
export const randomDate = (start: Date, end: Date): Date => {
  return faker.date.between({ from: start, to: end });
};

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Generate a list of unique random items from an array
 */
export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Get a random enum value
 */
export function getRandomEnumValue<T>(enumObj: { [key: string]: T }): T {
  const values = Object.values(enumObj);
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

/**
 * Get a random item from an array
 */
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate random users data
 */
export const generateUserData = async (count: number) => {
  const users = [];

  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const email = faker.internet
      .email({ firstName: name.split(" ")[0], lastName: name.split(" ")[1] })
      .toLowerCase();
    const password = await hashPassword("password123");

    users.push({
      id: generateId(),
      name,
      email,
      password,
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      updatedAt: new Date(),
    });
  }

  return users;
};
