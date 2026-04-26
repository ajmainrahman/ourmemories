import { pgTable, text, date, timestamp, uuid } from "drizzle-orm/pg-core";

export const milestonesTable = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: date("date").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MilestoneRow = typeof milestonesTable.$inferSelect;
export type InsertMilestoneRow = typeof milestonesTable.$inferInsert;
