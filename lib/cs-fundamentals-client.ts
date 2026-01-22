import axios from "axios";
import type {
  CsFundamentalsQuestion,
  GenerateCsMcqRequest,
  GenerateCsMcqResponse,
  SubmitCsAnswerRequest,
  SubmitCsAnswerResponse,
  GetCsProgressResponse,
  CsCategory,
} from "@/types/cs-fundamentals";

const API_BASE = "/api/cs-fundamentals";

/**
 * CS Fundamentals API Client - Helper functions for CS fundamentals MCQ endpoints
 */
export const csFundamentalsApi = {
  /**
   * Generate new personalized CS fundamentals MCQ questions for the user
   */
  async generateQuestions(
    request: GenerateCsMcqRequest,
  ): Promise<GenerateCsMcqResponse> {
    const response = await axios.post<GenerateCsMcqResponse>(
      `${API_BASE}/generate`,
      request,
    );
    return response.data;
  },

  /**
   * Get all CS fundamentals questions for a user
   */
  async getUserQuestions(
    userId: string,
    category?: CsCategory,
  ): Promise<CsFundamentalsQuestion[]> {
    const response = await axios.get(`${API_BASE}/questions`, {
      params: { userId, category },
    });
    return response.data.questions;
  },

  /**
   * Submit answer for a CS fundamentals question
   */
  async submitAnswer(
    request: SubmitCsAnswerRequest,
  ): Promise<SubmitCsAnswerResponse> {
    const response = await axios.post<SubmitCsAnswerResponse>(
      `${API_BASE}/submit`,
      request,
    );
    return response.data;
  },

  /**
   * Get user's CS fundamentals progress
   */
  async getProgress(userId: string): Promise<GetCsProgressResponse> {
    const response = await axios.get<GetCsProgressResponse>(
      `${API_BASE}/progress`,
      {
        params: { userId },
      },
    );
    return response.data;
  },
};

/**
 * Helper function to get badge color based on difficulty
 */
export function getCsDifficultyBadgeColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-500 hover:bg-green-600";
    case "medium":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "hard":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

/**
 * Helper function to get category display name
 */
export function getCategoryDisplayName(category: CsCategory): string {
  const names: Record<CsCategory, string> = {
    dbms: "Database Management Systems",
    os: "Operating Systems",
    network: "Computer Networks",
    oops: "Object-Oriented Programming",
  };
  return names[category];
}

/**
 * Helper function to get category icon
 */
export function getCategoryIcon(category: CsCategory): string {
  const icons: Record<CsCategory, string> = {
    dbms: "💾",
    os: "💻",
    network: "🌐",
    oops: "🔧",
  };
  return icons[category];
}
