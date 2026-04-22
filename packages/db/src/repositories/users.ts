import type { User, Role } from "@prisma/client";
import { db } from "../client";

export interface CreateUserInput {
  email: string;
  passwordHash?: string;
  role: Role;
  staffId?: string;
}

/**
 * Find a User by their email address. Returns null if not found.
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

/**
 * Find a User by their primary key. Returns null if not found.
 */
export async function findUserById(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}

/**
 * Create a new User record.
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  return db.user.create({ data: input });
}
