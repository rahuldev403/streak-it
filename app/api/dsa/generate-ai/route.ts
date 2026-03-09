import { db } from "@/app/config/db";
import { DsaQuestionTable, UserDsaProgressTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ProviderMode, resolveGeminiApiKey } from "@/lib/gemini-provider";
import { consumeAiGenerationQuota } from "@/lib/ai-rate-limit";
import { ensureCommunityGenerationAccess } from "@/lib/community-access";

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      count = 10,
      difficulty = "mixed",
      category,
      providerMode,
      communityId,
    } = await req.json();

    const authUser = await currentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userId && userId !== authUser.id) {
      return NextResponse.json(
        { error: "Forbidden: userId mismatch" },
        { status: 403 },
      );
    }

    const effectiveUserId = authUser.id;

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const parsedCommunityId =
      communityId !== undefined && communityId !== null
        ? Number(communityId)
        : undefined;

    if (
      communityId !== undefined &&
      communityId !== null &&
      !Number.isFinite(parsedCommunityId)
    ) {
      return NextResponse.json(
        { error: "Invalid communityId" },
        { status: 400 },
      );
    }

    const communityAccess = await ensureCommunityGenerationAccess(
      effectiveUserId,
      parsedCommunityId,
      "dsa",
    );
    if (!communityAccess.allowed) {
      return NextResponse.json(
        { error: communityAccess.error || "Community access denied" },
        { status: communityAccess.status || 403 },
      );
    }

    const limit = await consumeAiGenerationQuota(effectiveUserId);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: limit.error || "Generation limit reached",
          retryAfterSeconds: limit.retryAfterSeconds,
          remainingToday: limit.remainingToday,
        },
        { status: limit.status || 429 },
      );
    }

    // Get user's current skill level to personalize questions
    const userProgress = await db
      .select()
      .from(UserDsaProgressTable)
      .where(eq(UserDsaProgressTable.userId, effectiveUserId));

    const skillLevel = userProgress[0]?.skillLevel || "beginner";
    const preferredCategories = userProgress[0]?.preferredCategories
      ? JSON.parse(userProgress[0].preferredCategories)
      : [];
    const weakCategories = userProgress[0]?.weakCategories
      ? JSON.parse(userProgress[0].weakCategories)
      : [];

    const provider = await resolveGeminiApiKey(
      effectiveUserId,
      providerMode as ProviderMode | undefined,
    );
    if (!provider.success || !provider.apiKey) {
      return NextResponse.json(
        { error: provider.message || "AI provider is not available" },
        { status: provider.status || 500 },
      );
    }

    if (provider.mode === "platform") {
      const { has } = await auth();
      const hasUnlimitedPlan = has ? has({ plan: "unlimited" }) : false;
      const planFromMetadata = authUser.publicMetadata?.plan as string;
      const hasEntitlement =
        hasUnlimitedPlan || planFromMetadata === "unlimited";

      if (!hasEntitlement) {
        return NextResponse.json(
          {
            error:
              "Platform AI generation requires an unlimited plan. Use BYOK mode or upgrade your plan.",
          },
          { status: 402 },
        );
      }
    }

    const openai = new OpenAI({
      apiKey: provider.apiKey,
      baseURL:
        process.env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/openai",
    });

    // Generate DSA questions using Gemini (OpenAI-compatible API)
    const prompt = generateDsaPrompt(
      count,
      difficulty,
      category,
      skillLevel,
      weakCategories,
    );

    const completion = await openai.chat.completions.create({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
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
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from Gemini");
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
          userId: effectiveUserId,
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
        userId: effectiveUserId,
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
      remainingToday: limit.remainingToday,
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
