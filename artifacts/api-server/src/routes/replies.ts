import { Router, type IRouter } from "express";
import { db, repliesTable, memoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { CreateReplyBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(row: typeof repliesTable.$inferSelect) {
  return {
    id: row.id,
    memoryId: row.memoryId,
    authorId: row.authorId,
    authorName: row.authorName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/memories/:id/replies", async (req, res) => {
  const rows = await db
    .select()
    .from(repliesTable)
    .where(eq(repliesTable.memoryId, req.params.id))
    .orderBy(asc(repliesTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/memories/:id/replies", async (req, res) => {
  const body = CreateReplyBody.parse(req.body);
  const [memory] = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.id, req.params.id));
  if (!memory) {
    res.status(404).json({ message: "Memory not found" });
    return;
  }
  const [row] = await db
    .insert(repliesTable)
    .values({
      memoryId: req.params.id,
      authorId: req.user!.userId,
      authorName: req.user!.name,
      body: body.body,
    })
    .returning();
  res.status(201).json(serialize(row));
});

router.delete("/replies/:id", async (req, res) => {
  const [existing] = await db
    .select()
    .from(repliesTable)
    .where(eq(repliesTable.id, req.params.id));
  if (!existing) {
    res.status(404).json({ message: "Reply not found" });
    return;
  }
  if (existing.authorId !== req.user!.userId) {
    res.status(403).json({ message: "You can only delete your own replies" });
    return;
  }
  await db.delete(repliesTable).where(eq(repliesTable.id, req.params.id));
  res.status(204).end();
});

export default router;
