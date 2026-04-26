import { pgTable, text, boolean, timestamp, date, uuid } from "drizzle-orm/pg-core";

export const lettersTable = pgTable("letters", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromAuthor: text("from_author").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  unsealsAt: date("unseals_at").notNull(),
  read: boolean("read").notNull().default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LetterRow = typeof lettersTable.$inferSelect;
export type InsertLetterRow = typeof lettersTable.$inferInsert;
