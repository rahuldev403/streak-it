import { db } from "@/app/config/db";
import { ChapterContentTable, CourseChapterTable } from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Import content data from scripts folder reference
// This is a simplified version - you can extend it with actual data from your scripts
const getWebFoundationsContent = () => {
  return [
    {
      chapterName: "Semantic HTML Structure",
      contents: [
        {
          title: "Build a Blog Article with Semantic HTML",
          questionType: "html-css-js" as const,
          problemStatement: `Create a complete blog article layout using only semantic HTML5 tags. No divs allowed! Learn how proper semantic structure improves SEO and accessibility.`,
          instructions: `**Your Task:**
- Use <article> as the main container
- Add <header> with the article title and author info
- Use <section> tags for different content sections
- Include a <footer> with publication date
- Add <aside> for related links
- NO <div> tags allowed in this exercise!`,
          expectedOutput: `A properly structured blog article with semantic tags`,
          hints: `Remember: <article> is for self-contained content, <section> groups related content`,
          boilerplateFiles: JSON.stringify([
            {
              name: "index.html",
              language: "html",
              readonly: false,
              content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Article</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Your semantic HTML here -->
</body>
</html>`,
            },
            {
              name: "style.css",
              language: "css",
              readonly: false,
              content: `/* Add your styles here */
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}`,
            },
          ]),
          testCases: JSON.stringify([]),
          solutionCode: `<!-- Solution with proper semantic structure -->`,
          order: 1,
        },
      ],
    },
  ];
};

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!isAdmin(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    const courseId = "web-foundations";
    const contentData = getWebFoundationsContent();
    let insertedCount = 0;

    for (const chapterData of contentData) {
      // Find chapter by name
      const chapters = await db
        .select()
        .from(CourseChapterTable)
        .where(eq(CourseChapterTable.courseId, courseId))
        .limit(100);

      const chapter = chapters.find((c) => c.name === chapterData.chapterName);

      if (!chapter) {
        console.log(
          `Chapter "${chapterData.chapterName}" not found, skipping...`
        );
        continue;
      }

      // Insert content for this chapter
      for (const content of chapterData.contents) {
        try {
          await db.insert(ChapterContentTable).values({
            chapterId: chapter.id,
            title: content.title,
            problemStatement: content.problemStatement,
            instructions: content.instructions,
            expectedOutput: content.expectedOutput,
            hints: content.hints || "",
            questionType: content.questionType,
            boilerplateFiles: content.boilerplateFiles,
            testCases: content.testCases,
            solutionCode: content.solutionCode,
            order: content.order,
          });
          insertedCount++;
        } catch (error) {
          console.log(`Content "${content.title}" might already exist`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedCount} content items for HTML/CSS/JS chapters`,
    });
  } catch (error) {
    console.error("Error seeding content:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed content",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
