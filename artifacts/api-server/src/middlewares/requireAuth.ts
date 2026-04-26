import type { Request, Response, NextFunction } from "express";
import { COOKIE_NAME, verifySession, type SessionPayload } from "../lib/auth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}

export function loadUser(req: Request, _res: Response, next: NextFunction) {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  const token = cookies?.[COOKIE_NAME];
  if (token) {
    const session = verifySession(token);
    if (session) req.user = session;
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ message: "Not signed in" });
    return;
  }
  next();
}
