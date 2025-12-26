"use client";

import { ChapterContentData } from "@/types/chapter-content";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
interface ProblemStatementProps {
  content: ChapterContentData;
}
import idea from "@/public/code-challange/idea.png";
import pr from "@/public/code-challange/magnifying-glass.png";
import test from "@/public/code-challange/exam-time.png";
export default function ProblemStatement({ content }: ProblemStatementProps) {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <h1 className="text-3xl font-bold font-game font-normal mb-4 text-black dark:text-white border-b-4 border-gray-800 pb-2">
          {content.title}
        </h1>

        <div className="space-y-4">
          {/* Problem Statement */}
          <div className="border-4 border-gray-800 bg-yellow-100 dark:bg-yellow-900/30 p-4 shadow-[4px_4px_0_0_#000]">
            <h2 className="font-game font-normal text-lg mb-2 flex items-center gap-2">
             <Image src={pr} alt="Problem Statement" className="w-5 h-5" />
             Problem Statement
            </h2>
            <div className="font-mono text-sm prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content.problemStatement}</ReactMarkdown>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-4 border-gray-800 bg-blue-100 dark:bg-blue-900/30 p-4 shadow-[4px_4px_0_0_#000]">
            <h2 className="font-game font-normal text-lg mb-2 flex items-center gap-2">
              <Image src={idea} alt="Instructions" className="w-5 h-5" />
              Instructions
            </h2>
            <div className="font-mono text-sm prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content.instructions}</ReactMarkdown>
            </div>
          </div>

          {/* Expected Output */}
          <div className="border-4 border-gray-800 bg-green-100 dark:bg-green-900/30 p-4 shadow-[4px_4px_0_0_#000]">
            <h2 className="font-game font-normal text-lg mb-2 flex items-center gap-2">
              [✓] Expected Output
            </h2>
            <div className="font-mono text-sm prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content.expectedOutput}</ReactMarkdown>
            </div>
          </div>

          {/* Hints (collapsible) */}
          {content.hints && (
            <details className="border-4 border-gray-800 bg-purple-100 dark:bg-purple-900/30 p-4 shadow-[4px_4px_0_0_#000]">
              <summary className="font-game font-normal text-lg cursor-pointer hover:text-purple-600">
                [?] Hints (Click to reveal)
              </summary>
              <div className="font-mono text-sm mt-3 prose dark:prose-invert max-w-none">
                <ReactMarkdown>{content.hints}</ReactMarkdown>
              </div>
            </details>
          )}

          {/* Test Cases */}
          {content.testCases && content.testCases.length > 0 && (
            <div className="border-4 border-gray-800 bg-orange-100 dark:bg-orange-900/30 p-4 shadow-[4px_4px_0_0_#000]">
              <h2 className="font-game font-normal text-lg mb-3 flex items-center gap-2">
                <Image src={test} alt="Test Cases" className="w-5 h-5" />
                Test Cases
              </h2>
              <div className="space-y-2">
                {content.testCases.map((testCase, index) => (
                  <div
                    key={testCase.id}
                    className="bg-white/50 dark:bg-black/20 p-3 rounded border-2 border-gray-600"
                  >
                    <p className="font-semibold text-sm">
                      Test {index + 1}: {testCase.description}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Expected: {testCase.expectedOutput}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
