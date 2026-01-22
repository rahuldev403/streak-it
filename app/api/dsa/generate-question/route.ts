import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import {
  DsaQuestionTable,
  UserDsaProgressTable,
  DsaSubmissionTable,
} from "@/app/config/schema";
import { eq, and, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get user's DSA progress to personalize the question
    let userProgress = await db
      .select()
      .from(UserDsaProgressTable)
      .where(eq(UserDsaProgressTable.userId, userId))
      .limit(1);

    // If no progress exists, create initial progress entry
    if (userProgress.length === 0) {
      await db.insert(UserDsaProgressTable).values({
        userId,
        totalQuestionsSolved: 0,
        easyQuestionsSolved: 0,
        mediumQuestionsSolved: 0,
        hardQuestionsSolved: 0,
        skillLevel: "beginner",
        preferredCategories: JSON.stringify([]),
        weakCategories: JSON.stringify([]),
        lastActivityDate: new Date().toISOString(),
      });

      userProgress = await db
        .select()
        .from(UserDsaProgressTable)
        .where(eq(UserDsaProgressTable.userId, userId))
        .limit(1);
    }

    const progress = userProgress[0];

    // Get recent submissions to understand user's strengths and weaknesses
    const recentSubmissions = await db
      .select()
      .from(DsaSubmissionTable)
      .where(eq(DsaSubmissionTable.userId, userId))
      .orderBy(desc(DsaSubmissionTable.submittedAt))
      .limit(10);

    // Generate personalized question using OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    // Determine difficulty based on user's skill level
    const difficulty = determineDifficulty(progress.skillLevel, progress);

    // Determine category based on weak areas or variety
    const category = determineCategory(
      progress.weakCategories || "",
      progress.preferredCategories || "",
    );

    // Call Azure OpenAI API to generate question
    const questionData = await generateQuestionWithAzureOpenAI(
      difficulty,
      category,
      progress.skillLevel,
      recentSubmissions,
    );

    // Save the generated question to database
    const [savedQuestion] = await db
      .insert(DsaQuestionTable)
      .values({
        userId,
        title: questionData.title,
        description: questionData.description,
        difficulty: questionData.difficulty,
        category: questionData.category,
        constraints: questionData.constraints,
        examples: JSON.stringify(questionData.examples),
        testCases: JSON.stringify(questionData.testCases),
        starterCode: JSON.stringify(questionData.starterCode),
        hints: JSON.stringify(questionData.hints),
        generatedAt: new Date().toISOString(),
        tags: questionData.tags,
        timeComplexity: questionData.timeComplexity,
        spaceComplexity: questionData.spaceComplexity,
      })
      .returning();

    return NextResponse.json({
      success: true,
      question: savedQuestion,
    });
  } catch (error: any) {
    console.error("Error generating DSA question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate question" },
      { status: 500 },
    );
  }
}

// Helper function to determine difficulty
function determineDifficulty(skillLevel: string, progress: any): string {
  const solvedCount = progress.totalQuestionsSolved;

  if (skillLevel === "beginner" || solvedCount < 10) {
    return "easy";
  } else if (skillLevel === "intermediate" || solvedCount < 50) {
    return Math.random() < 0.7 ? "easy" : "medium";
  } else if (skillLevel === "advanced" || solvedCount < 100) {
    return Math.random() < 0.5 ? "medium" : "hard";
  } else {
    const rand = Math.random();
    if (rand < 0.3) return "medium";
    return "hard";
  }
}

// Helper function to determine category
function determineCategory(
  weakCategories: string,
  preferredCategories: string,
): string {
  const categories = [
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
  ];

  try {
    const weak = JSON.parse(weakCategories || "[]");
    // 70% chance to focus on weak areas
    if (weak.length > 0 && Math.random() < 0.7) {
      return weak[Math.floor(Math.random() * weak.length)];
    }
  } catch (e) {
    // If parsing fails, continue to random selection
  }

  // Return random category for variety
  return categories[Math.floor(Math.random() * categories.length)];
}

// Helper function to call OpenAI API
async function generateQuestionWithAzureOpenAI(
  difficulty: string,
  category: string,
  skillLevel: string,
  recentSubmissions: any[],
): Promise<any> {
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";

  if (!azureApiKey || !azureEndpoint) {
    throw new Error("Azure OpenAI API configuration missing");
  }
  const submissionContext =
    recentSubmissions.length > 0
      ? `The user has recently worked on ${recentSubmissions.length} problems. Consider their progress.`
      : "This is a new user.";

  const prompt = `Generate a unique and personalized Data Structures and Algorithms coding question with the following specifications:

Difficulty: ${difficulty}
Category: ${category}
User Skill Level: ${skillLevel}
Context: ${submissionContext}

Please generate a UNIQUE question (not from LeetCode or common platforms) that is:
1. Appropriate for the difficulty level
2. Focused on ${category}
3. Educational and helps the user improve

Return a JSON object with the following structure:
{
  "title": "Question title",
  "description": "Detailed problem description",
  "difficulty": "${difficulty}",
  "category": "${category}",
  "constraints": "Problem constraints (e.g., array size, value ranges)",
  "examples": [
    {
      "input": "example input",
      "output": "example output",
      "explanation": "why this output"
    }
  ],
  "testCases": [
    {
      "input": "test input",
      "expectedOutput": "expected output",
      "isHidden": false
    }
  ],
  "starterCode": {
    "python": "def solution():\\n    pass",
    "javascript": "function solution() {\\n    // your code\\n}",
    "java": "class Solution {\\n    public void solution() {\\n        // your code\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    void solution() {\\n        // your code\\n    }\\n};"
  },
  "hints": ["hint 1", "hint 2", "hint 3"],
  "tags": "tag1, tag2, tag3",
  "timeComplexity": "Expected time complexity (e.g., O(n))",
  "spaceComplexity": "Expected space complexity (e.g., O(1))"
}

Make sure the question is ORIGINAL and not copied from existing platforms. Focus on teaching the concept.`;

  const azureUrl = `${azureEndpoint}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(azureUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": azureApiKey,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are an expert computer science educator who creates original, educational coding problems. Generate unique questions that are not from LeetCode or other platforms.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Azure OpenAI API error: ${response.statusText} - ${errorText}`,
    );
  }

  const data = await response.json();
  const questionData = JSON.parse(data.choices[0].message.content);

  return questionData;
}
