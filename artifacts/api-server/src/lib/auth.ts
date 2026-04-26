import jwt from "jsonwebtoken";

const SECRET = process.env["SESSION_SECRET"] ?? "dev-insecure-change-me";
export const COOKIE_NAME = "om_session";
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: SEVEN_DAYS_SECONDS });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload & SessionPayload;
    if (!decoded.userId || !decoded.email || !decoded.name) return null;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    return null;
  }
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env["NODE_ENV"] === "production",
  maxAge: SEVEN_DAYS_SECONDS * 1000,
};
