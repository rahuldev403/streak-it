// DSA Question Types
export interface DsaQuestion {
  id: number;
  userId: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  constraints: string;
  examples: Example[];
  testCases: TestCase[];
  starterCode: StarterCode;
  hints: string[];
  generatedAt: string;
  tags: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface Example {
  input: string;
  output: string;
  explanation: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface StarterCode {
  python?: string;
  javascript?: string;
  java?: string;
  cpp?: string;
  c?: string;
  typescript?: string;
  go?: string;
  rust?: string;
}

// Submission Types
export interface DsaSubmission {
  id: number;
  userId: string;
  questionId: number;
  code: string;
  language: string;
  status: SubmissionStatus;
  executionTime: string;
  memory: string;
  submittedAt: string;
  testCasesPassed: number;
  totalTestCases: number;
}

export type SubmissionStatus =
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "compilation_error"
  | "time_limit_exceeded"
  | "error";

export interface SubmissionResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  status: SubmissionStatus;
  executionTime: string;
  memory: string;
  stderr?: string;
  compileOutput?: string;
  error?: string;
}

// Progress Types
export interface UserDsaProgress {
  id: number;
  userId: string;
  totalQuestionsSolved: number;
  easyQuestionsSolved: number;
  mediumQuestionsSolved: number;
  hardQuestionsSolved: number;
  skillLevel: SkillLevel;
  preferredCategories: string[];
  weakCategories: string[];
  lastActivityDate: string;
}

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

// API Request/Response Types
export interface GenerateQuestionRequest {
  userId: string;
}

export interface GenerateQuestionResponse {
  success: boolean;
  question: DsaQuestion;
}

export interface SubmitCodeRequest {
  userId: string;
  questionId: number;
  code: string;
  language: string;
}

export interface SubmitCodeResponse {
  success: boolean;
  submission: DsaSubmission;
  results: SubmissionResult[];
  summary: {
    totalTestCases: number;
    passedTestCases: number;
    status: SubmissionStatus;
    allPassed: boolean;
  };
}

export interface GetProgressResponse {
  success: boolean;
  progress: UserDsaProgress;
}

export interface UpdateProgressRequest {
  userId: string;
  weakCategories?: string[];
  preferredCategories?: string[];
}

// Categories
export const DSA_CATEGORIES = [
  "arrays",
  "strings",
  "linked-lists",
  "stacks",
  "queues",
  "trees",
  "graphs",
  "dynamic-programming",
  "recursion",
  "sorting",
  "searching",
  "hash-tables",
  "heaps",
  "greedy",
  "backtracking",
  "bit-manipulation",
  "math",
  "two-pointers",
  "sliding-window",
  "binary-search",
] as const;

export type DsaCategory = (typeof DSA_CATEGORIES)[number];

// Languages
export const SUPPORTED_LANGUAGES = [
  "python",
  "javascript",
  "java",
  "cpp",
  "c",
  "typescript",
  "go",
  "rust",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language Display Names
export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  python: "Python 3",
  javascript: "JavaScript (Node.js)",
  java: "Java",
  cpp: "C++",
  c: "C",
  typescript: "TypeScript",
  go: "Go",
  rust: "Rust",
};
