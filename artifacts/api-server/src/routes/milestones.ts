import { Router, type IRouter } from "express";
import { db, milestonesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { CreateMilestoneBody, UpdateMilestoneBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(row: typeof milestonesTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    description: row.description,
    icon: row.icon,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/milestones", async (_req, res) => {
  const rows = await db
    .select()
    .from(milestonesTable)
    .orderBy(asc(milestonesTable.date));
  res.json(rows.map(serialize));
});

router.post("/milestones", async (req, res) => {
  const body = CreateMilestoneBody.parse(req.body);
  const [row] = await db
    .insert(milestonesTable)
    .values({
      title: body.title,
      date: body.date,
      description: body.description ?? null,
      icon: body.icon ?? null,
    })
    .returning();
  res.status(201).json(serialize(row));
});

router.patch("/milestones/:id", async (req, res) => {
  const body = UpdateMilestoneBody.parse(req.body);
  const updates: Partial<typeof milestonesTable.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.date !== undefined) updates.date = body.date;
  if (body.description !== undefined) updates.description = body.description;
  if (body.icon !== undefined) updates.icon = body.icon;
  const [row] = await db
    .update(milestonesTable)
    .set(updates)
    .where(eq(milestonesTable.id, req.params.id))
    .returning();
  if (!row) {
    res.status(404).json({ message: "Milestone not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/milestones/:id", async (req, res) => {
  await db.delete(milestonesTable).where(eq(milestonesTable.id, req.params.id));
  res.status(204).end();
});

export default router;
