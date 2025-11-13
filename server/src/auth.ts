import jwt from "jsonwebtoken";

const JWT_SECRET = "your-super-secret-jwt-key-2025";

export const signToken = (username: string): string => {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { username: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string };
  } catch {
    return null;
  }
};