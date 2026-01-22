// CS Fundamentals Types for Interview Prep

export type CsCategory = "dbms" | "os" | "network" | "oops";

export interface CsFundamentalsQuestion {
  id: number;
  userId: string;
  category: CsCategory;
  question: string;
  options: string[]; // Array of 4 options
  correctAnswer: string; // A, B, C, or D
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  generatedAt: string;
  tags?: string;
}

export interface CsFundamentalsSubmission {
  id: number;
  userId: string;
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface UserCsFundamentalsProgress {
  id: number;
  userId: string;
  category: CsCategory;
  totalQuestionsSolved: number;
  correctAnswers: number;
  easyQuestionsSolved: number;
  mediumQuestionsSolved: number;
  hardQuestionsSolved: number;
  lastActivityDate?: string;
}

// API Request/Response types
export interface GenerateCsMcqRequest {
  userId: string;
  category: CsCategory;
  count?: number; // Default 15
  difficulty?: "easy" | "medium" | "hard" | "mixed";
}

export interface GenerateCsMcqResponse {
  success: boolean;
  questions: CsFundamentalsQuestion[];
  message?: string;
}

export interface SubmitCsAnswerRequest {
  userId: string;
  questionId: number;
  selectedAnswer: string;
}

export interface SubmitCsAnswerResponse {
  success: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  submission: CsFundamentalsSubmission;
}

export interface GetCsProgressResponse {
  success: boolean;
  progress: UserCsFundamentalsProgress[];
  overallStats: {
    totalQuestionsSolved: number;
    correctAnswers: number;
    accuracy: number;
  };
}

// Interview prep bundle types
export interface InterviewPrepBundle {
  id: string;
  name: string;
  category: CsCategory | "dsa";
  description: string;
  questionsPerGeneration: number;
  icon: string;
  color: string;
}
