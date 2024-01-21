import { z } from "zod";

// Game
export const gameSchema = z.object({
  name: z.string().min(3).max(50),
});

// User
export const userSchema = z.object({
  email: z.string().min(3).max(50),
  hashedPassword: z.string(),
});
