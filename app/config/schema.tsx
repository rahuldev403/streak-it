import { integer, pgTable, varchar, text } from "drizzle-orm/pg-core";

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

export const CourseChapterTable = pgTable("course_chapters", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: varchar({ length: 100 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  desc: varchar({ length: 1000 }).notNull(),
  exercise: varchar({ length: 1000 }),
});

export const EnrolledCourseTable = pgTable("enrolled_courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: varchar({ length: 100 }).notNull(),
  userId: varchar({ length: 100 }).notNull(),
  enrolledDate: varchar({ length: 100 }).notNull(),
  progress: integer().default(0).notNull(),
});

export const UserProgressTable = pgTable("user_progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 100 }).notNull(),
  courseId: varchar({ length: 100 }).notNull(),
  chapterId: varchar({ length: 100 }).notNull(),
  updatedAt: varchar({ length: 100 }).notNull(),
});

export const ChapterContentTable = pgTable("chapter_content", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  chapterId: integer().notNull(),
  title: varchar({ length: 255 }).notNull(),
  problemStatement: text().notNull(),
  instructions: text().notNull(),
  expectedOutput: text().notNull(),
  hints: text(),
  questionType: varchar({ length: 50 }).notNull(), // 'html-css-js', 'react', 'nextjs', 'nodejs', 'typescript', 'mern'
  boilerplateFiles: text().notNull(), // JSON string
  testCases: text().notNull(), // JSON string
  solutionCode: text().notNull(),
  order: integer().default(0).notNull(),
});

export const UserActivityTable = pgTable("user_activity", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 100 }).notNull(),
  date: varchar({ length: 100 }).notNull(), // YYYY-MM-DD format
  activitiesCount: integer().default(0).notNull(),
});
