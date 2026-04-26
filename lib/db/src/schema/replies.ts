import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { memoriesTable } from "./memories";
import { usersTable } from "./users";

export const repliesTable = pgTable("replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  memoryId: uuid("memory_id")
    .notNull()
    .references(() => memoriesTable.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReplyRow = typeof repliesTable.$inferSelect;
export type InsertReplyRow = typeof repliesTable.$inferInsert;
