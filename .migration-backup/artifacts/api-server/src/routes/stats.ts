import { Router, type IRouter } from "express";
import { db, memoriesTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res) => {
  const [agg] = await db
    .select({
      total: sql<number>`count(*)::int`,
      favoriteCount: sql<number>`sum(case when ${memoriesTable.favorite} then 1 else 0 end)::int`,
      photoCount: sql<number>`coalesce(sum(coalesce(array_length(${memoriesTable.photos}, 1), 0)), 0)::int`,
      firstDate: sql<string | null>`min(${memoriesTable.memoryDate})::text`,
      latestDate: sql<string | null>`max(${memoriesTable.memoryDate})::text`,
    })
    .from(memoriesTable);

  const moodRows = await db
    .select({
      mood: memoriesTable.mood,
      count: sql<number>`count(*)::int`,
    })
    .from(memoriesTable)
    .where(sql`${memoriesTable.mood} is not null`)
    .groupBy(memoriesTable.mood)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  let daysTogether = 0;
  if (agg?.firstDate && agg?.latestDate) {
    const first = new Date(agg.firstDate);
    const latest = new Date(agg.latestDate);
    daysTogether = Math.max(
      0,
      Math.round((latest.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  // Streak: count consecutive days ending today with at least one memory
  const dateRows = await db
    .selectDistinct({ d: memoriesTable.memoryDate })
    .from(memoriesTable);
  const dateSet = new Set(dateRows.map((r) => r.d));
  let streakDays = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (dateSet.has(iso)) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  res.json({
    totalMemories: agg?.total ?? 0,
    favoriteCount: agg?.favoriteCount ?? 0,
    photoCount: agg?.photoCount ?? 0,
    firstMemoryDate: agg?.firstDate ?? null,
    latestMemoryDate: agg?.latestDate ?? null,
    daysTogether,
    streakDays,
    topMood: moodRows[0]?.mood ?? null,
  });
});

router.get("/stats/mood-breakdown", async (_req, res) => {
  const rows = await db
    .select({
      mood: memoriesTable.mood,
      count: sql<number>`count(*)::int`,
    })
    .from(memoriesTable)
    .where(sql`${memoriesTable.mood} is not null`)
    .groupBy(memoriesTable.mood)
    .orderBy(desc(sql`count(*)`));
  res.json(
    rows
      .filter((r) => !!r.mood)
      .map((r) => ({ mood: r.mood as string, count: r.count })),
  );
});

router.get("/stats/tags", async (_req, res) => {
  const rows = await db.execute<{ tag: string; count: number }>(sql`
    select tag, count(*)::int as count
    from (
      select unnest(${memoriesTable.tags}) as tag from ${memoriesTable}
    ) t
    group by tag
    order by count desc
  `);
  res.json(rows.rows.map((r) => ({ tag: r.tag, count: Number(r.count) })));
});

router.get("/stats/timeline", async (_req, res) => {
  const rows = await db.execute<{ month: string; count: number }>(sql`
    select to_char(${memoriesTable.memoryDate}, 'YYYY-MM') as month,
           count(*)::int as count
    from ${memoriesTable}
    group by month
    order by month asc
  `);
  res.json(rows.rows.map((r) => ({ month: r.month, count: Number(r.count) })));
});

export default router;
