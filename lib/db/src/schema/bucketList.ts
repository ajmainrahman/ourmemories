import { pgTable, text, boolean, date, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const bucketListTable = pgTable("bucket_list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  deadline: date("deadline"),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  addedById: uuid("added_by_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  addedByName: text("added_by_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BucketListRow = typeof bucketListTable.$inferSelect;
export type InsertBucketListRow = typeof bucketListTable.$inferInsert;
