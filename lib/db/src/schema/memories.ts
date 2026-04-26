import { pgTable, text, boolean, timestamp, date, uuid } from "drizzle-orm/pg-core";

export const memoriesTable = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  memoryDate: date("memory_date").notNull(),
  location: text("location"),
  mood: text("mood"),
  author: text("author").notNull().default("both"),
  tags: text("tags").array().notNull().default([]),
  photos: text("photos").array().notNull().default([]),
  favorite: boolean("favorite").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MemoryRow = typeof memoriesTable.$inferSelect;
export type InsertMemoryRow = typeof memoriesTable.$inferInsert;
