import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { signSession, COOKIE_NAME, COOKIE_OPTIONS } from "../lib/auth";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function publicUser(row: typeof usersTable.$inferSelect) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res) => {
  const body = RegisterBody.parse(req.body);
  const email = body.email.toLowerCase().trim();
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ message: "An account with that email already exists" });
    return;
  }
  const passwordHash = await bcrypt.hash(body.password, 10);
  const [row] = await db
    .insert(usersTable)
    .values({ email, name: body.name.trim(), passwordHash })
    .returning();
  const token = signSession({ userId: row.id, email: row.email, name: row.name });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(201).json(publicUser(row));
});

router.post("/auth/login", async (req, res) => {
  const body = LoginBody.parse(req.body);
  const email = body.email.toLowerCase().trim();
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!row) {
    res.status(401).json({ message: "Wrong email or password" });
    return;
  }
  const ok = await bcrypt.compare(body.password, row.passwordHash);
  if (!ok) {
    res.status(401).json({ message: "Wrong email or password" });
    return;
  }
  const token = signSession({ userId: row.id, email: row.email, name: row.name });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json(publicUser(row));
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.status(204).end();
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId));
  if (!row) {
    res.status(401).json({ message: "Not signed in" });
    return;
  }
  res.json(publicUser(row));
});

export default router;
