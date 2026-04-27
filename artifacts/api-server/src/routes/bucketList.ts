import { Router, type IRouter } from "express";
import { db, bucketListTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import {
  CreateBucketListItemBody,
  UpdateBucketListItemBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(row: typeof bucketListTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    deadline: row.deadline,
    completed: row.completed,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    addedById: row.addedById,
    addedByName: row.addedByName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/bucket-list", async (_req, res) => {
  const rows = await db
    .select()
    .from(bucketListTable)
    .orderBy(asc(bucketListTable.completed), desc(bucketListTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/bucket-list", async (req, res) => {
  const body = CreateBucketListItemBody.parse(req.body);
  const [row] = await db
    .insert(bucketListTable)
    .values({
      title: body.title,
      description: body.description ?? null,
      category: body.category ?? null,
      deadline: body.deadline ?? null,
      addedById: req.user!.userId,
      addedByName: req.user!.name,
    })
    .returning();
  res.status(201).json(serialize(row));
});

router.patch("/bucket-list/:id", async (req, res) => {
  const body = UpdateBucketListItemBody.parse(req.body);
  const updates: Partial<typeof bucketListTable.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.category !== undefined) updates.category = body.category;
  if (body.deadline !== undefined) updates.deadline = body.deadline;
  if (body.completed !== undefined) {
    updates.completed = body.completed;
    updates.completedAt = body.completed ? new Date() : null;
  }
  const [row] = await db
    .update(bucketListTable)
    .set(updates)
    .where(eq(bucketListTable.id, req.params.id))
    .returning();
  if (!row) {
    res.status(404).json({ message: "Bucket list item not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/bucket-list/:id", async (req, res) => {
  await db.delete(bucketListTable).where(eq(bucketListTable.id, req.params.id));
  res.status(204).end();
});

export default router;
