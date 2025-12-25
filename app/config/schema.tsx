import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  points: integer().default(0),
  email: varchar({ length: 255 }).notNull().unique(),
  subscription: varchar(),
});

export const CourseTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: varchar({ length: 100 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1000 }).notNull(),
  bannerImage: varchar({ length: 500 }).notNull(),
  level: varchar({ length: 100 }).default("beginner").notNull(),
  tags: varchar({ length: 500 }),
});
