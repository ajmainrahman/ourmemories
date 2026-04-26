import { Router, type IRouter } from "express";
import { db, memoriesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  CreateMemoryBody,
  UpdateMemoryBody,
  ListMemoriesQueryParams,
  GetRecentMemoriesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(row: typeof memoriesTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    memoryDate: row.memoryDate,
    location: row.location,
    mood: row.mood,
    author: row.author,
    tags: row.tags ?? [],
    photos: row.photos ?? [],
    favorite: row.favorite,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/memories/on-this-day", async (_req, res) => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const rows = await db
    .select()
    .from(memoriesTable)
    .where(sql`to_char(${memoriesTable.memoryDate}, 'MM-DD') = ${`${month}-${day}`}`)
    .orderBy(desc(memoriesTable.memoryDate));
  res.json(rows.map(serialize));
});

router.get("/memories/recent", async (req, res) => {
  const params = GetRecentMemoriesQueryParams.parse({
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  const limit = params.limit ?? 5;
  const rows = await db
    .select()
    .from(memoriesTable)
    .orderBy(desc(memoriesTable.memoryDate), desc(memoriesTable.createdAt))
    .limit(limit);
  res.json(rows.map(serialize));
});

router.get("/memories", async (req, res) => {
  const parsed = ListMemoriesQueryParams.parse({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    mood: typeof req.query.mood === "string" ? req.query.mood : undefined,
    tag: typeof req.query.tag === "string" ? req.query.tag : undefined,
    year: req.query.year ? Number(req.query.year) : undefined,
    favorite:
      req.query.favorite === undefined
        ? undefined
        : req.query.favorite === "true" || req.query.favorite === true,
  });

  const conditions = [];
  if (parsed.search) {
    const term = `%${parsed.search}%`;
    conditions.push(
      sql`(${memoriesTable.title} ILIKE ${term} OR ${memoriesTable.body} ILIKE ${term} OR ${memoriesTable.location} ILIKE ${term})`,
    );
  }
  if (parsed.mood) {
    conditions.push(eq(memoriesTable.mood, parsed.mood));
  }
  if (parsed.tag) {
    conditions.push(sql`${parsed.tag} = ANY(${memoriesTable.tags})`);
  }
  if (parsed.year !== undefined) {
    conditions.push(
      sql`extract(year from ${memoriesTable.memoryDate}) = ${parsed.year}`,
    );
  }
  if (parsed.favorite !== undefined) {
    conditions.push(eq(memoriesTable.favorite, parsed.favorite));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(memoriesTable)
    .where(where)
    .orderBy(desc(memoriesTable.memoryDate), desc(memoriesTable.createdAt));

  res.json(rows.map(serialize));
});

router.post("/memories", async (req, res) => {
  const body = CreateMemoryBody.parse(req.body);
  const [row] = await db
    .insert(memoriesTable)
    .values({
      title: body.title,
      body: body.body,
      memoryDate: body.memoryDate,
      location: body.location ?? null,
      mood: body.mood ?? null,
      author: body.author,
      tags: body.tags ?? [],
      photos: body.photos ?? [],
    })
    .returning();
  res.status(201).json(serialize(row));
});

router.get("/memories/:id", async (req, res) => {
  const [row] = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.id, req.params.id));
  if (!row) {
    res.status(404).json({ message: "Memory not found" });
    return;
  }
  res.json(serialize(row));
});

router.patch("/memories/:id", async (req, res) => {
  const body = UpdateMemoryBody.parse(req.body);
  const updates: Partial<typeof memoriesTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.body !== undefined) updates.body = body.body;
  if (body.memoryDate !== undefined) updates.memoryDate = body.memoryDate;
  if (body.location !== undefined) updates.location = body.location;
  if (body.mood !== undefined) updates.mood = body.mood;
  if (body.author !== undefined) updates.author = body.author;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.photos !== undefined) updates.photos = body.photos;
  if (body.favorite !== undefined) updates.favorite = body.favorite;

  const [row] = await db
    .update(memoriesTable)
    .set(updates)
    .where(eq(memoriesTable.id, req.params.id))
    .returning();
  if (!row) {
    res.status(404).json({ message: "Memory not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/memories/:id", async (req, res) => {
  await db.delete(memoriesTable).where(eq(memoriesTable.id, req.params.id));
  res.status(204).send();
});

router.post("/memories/:id/favorite", async (req, res) => {
  const [existing] = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.id, req.params.id));
  if (!existing) {
    res.status(404).json({ message: "Memory not found" });
    return;
  }
  const [row] = await db
    .update(memoriesTable)
    .set({ favorite: !existing.favorite, updatedAt: new Date() })
    .where(eq(memoriesTable.id, req.params.id))
    .returning();
  res.json(serialize(row));
});

export default router;
