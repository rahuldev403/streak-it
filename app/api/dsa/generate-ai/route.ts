import { db } from "@/app/config/db";
import { DsaQuestionTable, UserDsaProgressTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      count = 10,
      difficulty = "mixed",
      category,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Get user's current skill level to personalize questions
    const userProgress = await db
      .select()
      .from(UserDsaProgressTable)
      .where(eq(UserDsaProgressTable.userId, userId));

    const skillLevel = userProgress[0]?.skillLevel || "beginner";
    const preferredCategories = userProgress[0]?.preferredCategories
      ? JSON.parse(userProgress[0].preferredCategories)
      : [];
    const weakCategories = userProgress[0]?.weakCategories
      ? JSON.parse(userProgress[0].weakCategories)
      : [];

    // Generate DSA questions using OpenAI
    const prompt = generateDsaPrompt(
      count,
      difficulty,
      category,
      skillLevel,
      weakCategories,
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert DSA (Data Structures and Algorithms) educator creating personalized coding interview questions. Generate questions in valid JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    const generatedData = JSON.parse(responseContent);
    const questions = generatedData.questions || [];

    // Store questions in database
    const insertedQuestions = [];
    const currentTimestamp = new Date().toISOString();

    for (const q of questions) {
      const [inserted] = await db
        .insert(DsaQuestionTable)
        .values({
          userId,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty || "medium",
          category: q.category,
          constraints: q.constraints || null,
          examples: JSON.stringify(q.examples),
          testCases: JSON.stringify(q.testCases),
          starterCode: JSON.stringify(q.starterCode),
          hints: q.hints ? JSON.stringify(q.hints) : null,
          generatedAt: currentTimestamp,
          tags: q.tags ? JSON.stringify(q.tags) : null,
          timeComplexity: q.timeComplexity || null,
          spaceComplexity: q.spaceComplexity || null,
        })
        .returning();

      insertedQuestions.push({
        ...inserted,
        examples: JSON.parse(inserted.examples),
        testCases: JSON.parse(inserted.testCases),
        starterCode: JSON.parse(inserted.starterCode),
        hints: inserted.hints ? JSON.parse(inserted.hints) : null,
        tags: inserted.tags ? JSON.parse(inserted.tags) : null,
      });
    }

    // Initialize user progress if not exists
    if (userProgress.length === 0) {
      await db.insert(UserDsaProgressTable).values({
        userId,
        totalQuestionsSolved: 0,
        easyQuestionsSolved: 0,
        mediumQuestionsSolved: 0,
        hardQuestionsSolved: 0,
        skillLevel: "beginner",
        preferredCategories: null,
        weakCategories: null,
        lastActivityDate: currentTimestamp,
      });
    }

    return NextResponse.json({
      success: true,
      questions: insertedQuestions,
      message: `Generated ${insertedQuestions.length} DSA coding questions`,
    });
  } catch (error) {
    console.error("Error generating DSA questions:", error);
    return NextResponse.json(
      {
        error: "Failed to generate DSA questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function generateDsaPrompt(
  count: number,
  difficulty: string,
  category: string | undefined,
  skillLevel: string,
  weakCategories: string[],
): string {
  const categoryFocus = category
    ? `Focus on ${category} problems.`
    : weakCategories.length > 0
      ? `Focus more on these weak areas: ${weakCategories.join(", ")}`
      : "Cover a variety of data structures and algorithms.";

  const difficultyInstruction =
    difficulty === "mixed"
      ? `Mix of difficulties appropriate for ${skillLevel} level`
      : `All questions should be ${difficulty} level`;

  return `Generate ${count} high-quality DSA coding interview questions personalized for a ${skillLevel} level programmer.

${categoryFocus}
${difficultyInstruction}

Requirements:
- Each question should be a complete coding problem with:
  * Clear problem statement (description)
  * Constraints
  * 2-3 example test cases with explanations
  * 3-5 hidden test cases (with inputs and expected outputs)
  * Starter code templates for Python, JavaScript, Java, and C++
  * 2-4 hints (progressively revealing the solution approach)
  * Expected time and space complexity
  * Relevant tags

Categories to choose from: arrays, strings, linked-lists, trees, graphs, dynamic-programming, greedy, binary-search, sorting, hash-tables, stacks, queues, heaps, backtracking, bit-manipulation, math, two-pointers, sliding-window

Return ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "title": "Two Sum",
      "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\\n\\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
      "difficulty": "easy",
      "category": "arrays",
      "constraints": "2 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9\\n-10^9 <= target <= 10^9",
      "examples": [
        {
          "input": "nums = [2,7,11,15], target = 9",
          "output": "[0,1]",
          "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
        }
      ],
      "testCases": [
        {
          "input": "nums = [3,2,4], target = 6",
          "expectedOutput": "[1,2]"
        }
      ],
      "starterCode": {
        "python": "def two_sum(nums, target):\\n    # Write your solution here\\n    pass",
        "javascript": "function twoSum(nums, target) {\\n    // Write your solution here\\n}",
        "java": "class Solution {\\n    public int[] twoSum(int[] nums, int target) {\\n        // Write your solution here\\n    }\\n}",
        "cpp": "class Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        // Write your solution here\\n    }\\n};"
      },
      "hints": [
        "Try using a hash map to store elements you've seen",
        "For each element, check if target - element exists in the map"
      ],
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "tags": ["hash-table", "array", "two-pointers"]
    }
  ]
}`;
}
