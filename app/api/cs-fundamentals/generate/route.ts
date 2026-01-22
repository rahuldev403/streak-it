import { db } from "@/app/config/db";
import {
  CsFundamentalsQuestionTable,
  UserCsFundamentalsProgressTable,
} from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { eq, and } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      category,
      count = 15,
      difficulty = "mixed",
    } = await req.json();

    if (!userId || !category) {
      return NextResponse.json(
        { error: "userId and category are required" },
        { status: 400 },
      );
    }

    // Validate category
    const validCategories = ["dbms", "os", "network", "oops"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be one of: dbms, os, network, oops" },
        { status: 400 },
      );
    }

    // Generate MCQ questions using OpenAI
    const prompt = generatePrompt(category, count, difficulty);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert computer science educator creating high-quality interview preparation questions. Generate MCQ questions in valid JSON format only.",
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
        .insert(CsFundamentalsQuestionTable)
        .values({
          userId,
          category,
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || "medium",
          generatedAt: currentTimestamp,
          tags: q.tags ? JSON.stringify(q.tags) : null,
        })
        .returning();

      insertedQuestions.push({
        ...inserted,
        options: JSON.parse(inserted.options),
        tags: inserted.tags ? JSON.parse(inserted.tags) : null,
      });
    }

    // Initialize or update user progress for this category
    const existingProgress = await db
      .select()
      .from(UserCsFundamentalsProgressTable)
      .where(
        and(
          eq(UserCsFundamentalsProgressTable.userId, userId),
          eq(UserCsFundamentalsProgressTable.category, category),
        ),
      );

    if (existingProgress.length === 0) {
      await db.insert(UserCsFundamentalsProgressTable).values({
        userId,
        category,
        totalQuestionsSolved: 0,
        correctAnswers: 0,
        easyQuestionsSolved: 0,
        mediumQuestionsSolved: 0,
        hardQuestionsSolved: 0,
        lastActivityDate: currentTimestamp,
      });
    }

    return NextResponse.json({
      success: true,
      questions: insertedQuestions,
      message: `Generated ${insertedQuestions.length} ${category.toUpperCase()} questions`,
    });
  } catch (error) {
    console.error("Error generating CS fundamentals questions:", error);
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function generatePrompt(
  category: string,
  count: number,
  difficulty: string,
): string {
  const categoryDescriptions: Record<string, string> = {
    dbms: "Database Management Systems (DBMS) - covering SQL, normalization, transactions, indexing, ACID properties, joins, query optimization, NoSQL databases",
    os: "Operating Systems (OS) - covering processes, threads, synchronization, deadlocks, memory management, virtual memory, file systems, CPU scheduling",
    network:
      "Computer Networks - covering OSI model, TCP/IP, HTTP/HTTPS, DNS, routing, protocols, network security, socket programming",
    oops: "Object-Oriented Programming (OOP) - covering classes, objects, inheritance, polymorphism, encapsulation, abstraction, design patterns, SOLID principles",
  };

  const difficultyInstruction =
    difficulty === "mixed"
      ? "Mix of easy, medium, and hard questions"
      : `All questions should be ${difficulty} level`;

  return `Generate ${count} high-quality multiple-choice questions (MCQs) for ${categoryDescriptions[category]}.

Requirements:
- ${difficultyInstruction}
- Each question should have exactly 4 options (A, B, C, D)
- Include detailed explanations for correct answers
- Make questions practical and interview-relevant
- Include concept-based, scenario-based, and code-based questions where applicable
- Add relevant tags for categorization

Return ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "question": "What is normalization in DBMS?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "B",
      "explanation": "Detailed explanation of why B is correct and why others are wrong",
      "difficulty": "easy",
      "tags": ["normalization", "database-design"]
    }
  ]
}`;
}
