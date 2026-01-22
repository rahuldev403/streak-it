import axios from "axios";
import type {
  GenerateQuestionRequest,
  GenerateQuestionResponse,
  SubmitCodeRequest,
  SubmitCodeResponse,
  GetProgressResponse,
  UpdateProgressRequest,
  DsaQuestion,
  DsaSubmission,
} from "@/types/dsa";

const API_BASE = "/api/dsa";

/**
 * DSA API Client - Helper functions for interacting with DSA endpoints
 */
export const dsaApi = {
  /**
   * Generate a new personalized DSA question for the user
   */
  async generateQuestion(
    userId: string
  ): Promise<GenerateQuestionResponse> {
    const response = await axios.post<GenerateQuestionResponse>(
      `${API_BASE}/generate-question`,
      { userId }
    );
    return response.data;
  },

  /**
   * Submit code for execution against test cases
   */
  async submitCode(
    request: SubmitCodeRequest
  ): Promise<SubmitCodeResponse> {
    const response = await axios.post<SubmitCodeResponse>(
      `${API_BASE}/submit-code`,
      request
    );
    return response.data;
  },

  /**
   * Get all questions for a user
   */
  async getUserQuestions(userId: string): Promise<DsaQuestion[]> {
    const response = await axios.get(`${API_BASE}/questions`, {
      params: { userId },
    });
    return response.data.questions;
  },

  /**
   * Get a specific question by ID
   */
  async getQuestion(
    questionId: number,
    userId: string
  ): Promise<DsaQuestion> {
    const response = await axios.get(
      `${API_BASE}/questions/${questionId}`,
      {
        params: { userId },
      }
    );
    return response.data.question;
  },

  /**
   * Delete a question
   */
  async deleteQuestion(
    questionId: number,
    userId: string
  ): Promise<void> {
    await axios.delete(`${API_BASE}/questions`, {
      params: { questionId, userId },
    });
  },

  /**
   * Get user's DSA progress
   */
  async getUserProgress(userId: string): Promise<GetProgressResponse> {
    const response = await axios.get<GetProgressResponse>(
      `${API_BASE}/progress`,
      {
        params: { userId },
      }
    );
    return response.data;
  },

  /**
   * Update user's weak/preferred categories
   */
  async updateProgress(
    request: UpdateProgressRequest
  ): Promise<void> {
    await axios.put(`${API_BASE}/progress`, request);
  },

  /**
   * Get all submissions for a user
   */
  async getUserSubmissions(userId: string): Promise<any[]> {
    const response = await axios.get(`${API_BASE}/submissions`, {
      params: { userId },
    });
    return response.data.submissions;
  },

  /**
   * Get submissions for a specific question
   */
  async getQuestionSubmissions(
    userId: string,
    questionId: number
  ): Promise<any[]> {
    const response = await axios.get(`${API_BASE}/submissions`, {
      params: { userId, questionId },
    });
    return response.data.submissions;
  },
};

/**
 * Helper function to format execution time
 */
export function formatExecutionTime(time: string | number): string {
  const timeNum = typeof time === "string" ? parseFloat(time) : time;
  if (timeNum < 1) {
    return `${(timeNum * 1000).toFixed(0)}ms`;
  }
  return `${timeNum.toFixed(3)}s`;
}

/**
 * Helper function to format memory usage
 */
export function formatMemory(memory: string | number): string {
  const memNum = typeof memory === "string" ? parseFloat(memory) : memory;
  if (memNum < 1024) {
    return `${memNum.toFixed(0)}KB`;
  }
  return `${(memNum / 1024).toFixed(2)}MB`;
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(
  difficulty: "easy" | "medium" | "hard"
): string {
  const colors = {
    easy: "text-green-600",
    medium: "text-yellow-600",
    hard: "text-red-600",
  };
  return colors[difficulty];
}

/**
 * Get difficulty badge color for UI
 */
export function getDifficultyBadgeColor(
  difficulty: "easy" | "medium" | "hard"
): string {
  const colors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };
  return colors[difficulty];
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    accepted: "text-green-600",
    wrong_answer: "text-red-600",
    runtime_error: "text-orange-600",
    compilation_error: "text-purple-600",
    time_limit_exceeded: "text-blue-600",
    error: "text-gray-600",
  };
  return colors[status] || "text-gray-600";
}

/**
 * Get status badge color for UI
 */
export function getStatusBadgeColor(status: string): string {
  const colors: { [key: string]: string } = {
    accepted: "bg-green-100 text-green-800",
    wrong_answer: "bg-red-100 text-red-800",
    runtime_error: "bg-orange-100 text-orange-800",
    compilation_error: "bg-purple-100 text-purple-800",
    time_limit_exceeded: "bg-blue-100 text-blue-800",
    error: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Format status text for display
 */
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Calculate success rate from submissions
 */
export function calculateSuccessRate(submissions: DsaSubmission[]): number {
  if (submissions.length === 0) return 0;
  const accepted = submissions.filter((s) => s.status === "accepted").length;
  return Math.round((accepted / submissions.length) * 100);
}

/**
 * Get skill level progress (for progress bar)
 */
export function getSkillLevelProgress(
  skillLevel: string,
  totalSolved: number
): number {
  const milestones = {
    beginner: { min: 0, max: 10 },
    intermediate: { min: 10, max: 50 },
    advanced: { min: 50, max: 100 },
    expert: { min: 100, max: 200 },
  };

  const milestone =
    milestones[skillLevel as keyof typeof milestones] ||
    milestones.beginner;
  const progress =
    ((totalSolved - milestone.min) / (milestone.max - milestone.min)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Get next milestone for skill level
 */
export function getNextMilestone(
  skillLevel: string,
  totalSolved: number
): number {
  const milestones = {
    beginner: 10,
    intermediate: 50,
    advanced: 100,
    expert: 200,
  };

  return milestones[skillLevel as keyof typeof milestones] || 10;
}
