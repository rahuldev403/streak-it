export type QuestionType =
  | "html-css-js"
  | "react"
  | "nextjs"
  | "nodejs"
  | "typescript"
  | "mern";

export interface BoilerplateFile {
  name: string;
  content: string;
  language: string; // 'html', 'css', 'javascript', 'typescript', 'json', 'jsx', 'tsx'
  readonly: boolean;
}

export interface TestCase {
  id: string;
  input?: string;
  expectedOutput: string;
  description: string;
}

export interface ChapterContentData {
  id: number;
  chapterId: number;
  title: string;
  problemStatement: string;
  instructions: string;
  expectedOutput: string;
  hints?: string | null;
  questionType: QuestionType;
  boilerplateFiles: BoilerplateFile[];
  testCases: TestCase[];
  solutionCode: string;
  order: number;
}

export interface PreviewConfig {
  enabled: boolean;
  type: "iframe" | "console" | "api-response";
  refreshOnCodeChange: boolean;
}
