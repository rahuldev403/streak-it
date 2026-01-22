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

// DSA Question Tables for personalized learning
export const DsaQuestionTable = pgTable("dsa_questions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 100 }).notNull(), // Personalized per user
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  difficulty: varchar({ length: 50 }).notNull(), // easy, medium, hard
  category: varchar({ length: 100 }).notNull(), // arrays, strings, trees, graphs, etc.
  constraints: text(),
  examples: text().notNull(), // JSON string
  testCases: text().notNull(), // JSON string with hidden test cases
  starterCode: text().notNull(), // JSON string with code templates for multiple languages
  hints: text(), // JSON array of hints
  generatedAt: varchar({ length: 100 }).notNull(),
  tags: varchar({ length: 500 }),
  timeComplexity: varchar({ length: 100 }),
  spaceComplexity: varchar({ length: 100 }),
});

export const DsaSubmissionTable = pgTable("dsa_submissions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 100 }).notNull(),
  questionId: integer().notNull(),
  code: text().notNull(),
  language: varchar({ length: 50 }).notNull(), // python, javascript, java, cpp
  status: varchar({ length: 50 }).notNull(), // accepted, wrong_answer, runtime_error, time_limit_exceeded
  executionTime: varchar({ length: 50 }),
  memory: varchar({ length: 50 }),
  submittedAt: varchar({ length: 100 }).notNull(),
  testCasesPassed: integer().default(0),
  totalTestCases: integer().default(0),
});

export const UserDsaProgressTable = pgTable("user_dsa_progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 100 }).notNull(),
  totalQuestionsSolved: integer().default(0),
  easyQuestionsSolved: integer().default(0),
  mediumQuestionsSolved: integer().default(0),
  hardQuestionsSolved: integer().default(0),
  skillLevel: varchar({ length: 50 }).default("beginner").notNull(), // beginner, intermediate, advanced, expert
  preferredCategories: text(), // JSON array of categories user is strong in
  weakCategories: text(), // JSON array of categories user needs improvement
  lastActivityDate: varchar({ length: 100 }),
});
