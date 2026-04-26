import { Router, type IRouter } from "express";
import { db, lettersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateLetterBody } from "@workspace/api-zod";

const router: IRouter = Router();

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function isSealed(unsealsAt: string): boolean {
  return unsealsAt > todayISO();
}

function serialize(row: typeof lettersTable.$inferSelect) {
  const sealed = isSealed(row.unsealsAt);
  return {
    id: row.id,
    fromAuthor: row.fromAuthor as "self" | "partner",
    subject: row.subject,
    body: sealed ? null : row.body,
    unsealsAt: row.unsealsAt,
    sealed,
    read: row.read,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/letters", async (_req, res) => {
  const rows = await db
    .select()
    .from(lettersTable)
    .orderBy(desc(lettersTable.unsealsAt), desc(lettersTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/letters", async (req, res) => {
  const parsed = CreateLetterBody.parse(req.body);
  const [row] = await db
    .insert(lettersTable)
    .values({
      fromAuthor: parsed.fromAuthor,
      subject: parsed.subject ?? null,
      body: parsed.body,
      unsealsAt: parsed.unsealsAt,
    })
    .returning();
  res.status(201).json(serialize(row));
});

router.get("/letters/:id", async (req, res) => {
  const [row] = await db
    .select()
    .from(lettersTable)
    .where(eq(lettersTable.id, req.params.id));
  if (!row) {
    res.status(404).json({ error: "Letter not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/letters/:id", async (req, res) => {
  await db.delete(lettersTable).where(eq(lettersTable.id, req.params.id));
  res.status(204).end();
});

router.post("/letters/:id/open", async (req, res) => {
  const [existing] = await db
    .select()
    .from(lettersTable)
    .where(eq(lettersTable.id, req.params.id));
  if (!existing) {
    res.status(404).json({ error: "Letter not found" });
    return;
  }
  if (isSealed(existing.unsealsAt)) {
    res.status(400).json({ error: "Letter is still sealed" });
    return;
  }
  if (existing.read) {
    res.json(serialize(existing));
    return;
  }
  const [row] = await db
    .update(lettersTable)
    .set({ read: true, readAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(lettersTable.id, req.params.id))
    .returning();
  res.json(serialize(row));
});

export default router;
