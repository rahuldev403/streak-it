"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, RotateCw } from "lucide-react";
import {
  dsaApi,
  getDifficultyBadgeColor,
  formatStatus,
  getStatusBadgeColor,
} from "@/lib/dsa-client";
import type { DsaQuestion, SubmitCodeResponse } from "@/types/dsa";

interface DSAPracticeProps {
  userId: string;
}

/**
 * Example component demonstrating DSA question generation and code submission
 * This shows how to use the personalized DSA system in your application
 */
export default function DSAPracticeExample({ userId }: DSAPracticeProps) {
  const [question, setQuestion] = useState<DsaQuestion | null>(null);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("python");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitCodeResponse | null>(null);

  // Generate a new personalized question
  const generateQuestion = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await dsaApi.generateQuestion(userId);
      setQuestion(response.question);

      // Parse starter code and set initial code
      const starterCode = JSON.parse(response.question.starterCode);
      setCode(starterCode[language] || "");
    } catch (error) {
      console.error("Error generating question:", error);
      alert("Failed to generate question. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Submit code for execution
  const submitCode = async () => {
    if (!question) return;

    setSubmitting(true);
    try {
      const response = await dsaApi.submitCode({
        userId,
        questionId: question.id,
        code,
        language,
      });
      setResult(response);
    } catch (error) {
      console.error("Error submitting code:", error);
      alert("Failed to submit code. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">DSA Practice (Personalized)</h1>
        <Button onClick={generateQuestion} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RotateCw className="mr-2 h-4 w-4" />
              Generate New Question
            </>
          )}
        </Button>
      </div>

      {!question && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Click "Generate New Question" to get a personalized DSA question
              based on your skill level and progress.
            </div>
          </CardContent>
        </Card>
      )}

      {question && (
        <>
          {/* Question Display */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{question.title}</CardTitle>
                  <CardDescription>
                    Category: {question.category} | Complexity:{" "}
                    {question.timeComplexity} time, {question.spaceComplexity}{" "}
                    space
                  </CardDescription>
                </div>
                <Badge className={getDifficultyBadgeColor(question.difficulty)}>
                  {question.difficulty.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Problem Description</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {question.description}
                </p>
              </div>

              {question.constraints && (
                <div>
                  <h3 className="font-semibold mb-2">Constraints</h3>
                  <p className="text-sm text-muted-foreground">
                    {question.constraints}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Examples</h3>
                {JSON.parse(question.examples).map(
                  (example: any, idx: number) => (
                    <div key={idx} className="bg-muted p-3 rounded-md mb-2">
                      <div className="text-sm">
                        <strong>Input:</strong> {example.input}
                      </div>
                      <div className="text-sm">
                        <strong>Output:</strong> {example.output}
                      </div>
                      {example.explanation && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>

              {question.hints && JSON.parse(question.hints).length > 0 && (
                <details>
                  <summary className="font-semibold cursor-pointer">
                    💡 Hints (click to reveal)
                  </summary>
                  <ul className="mt-2 space-y-1 ml-4 list-disc">
                    {JSON.parse(question.hints).map(
                      (hint: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {hint}
                        </li>
                      ),
                    )}
                  </ul>
                </details>
              )}
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Your Solution</CardTitle>
              <CardDescription>
                Write your code below. Select your preferred language.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {["python", "javascript", "java", "cpp"].map((lang) => (
                  <Button
                    key={lang}
                    variant={language === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setLanguage(lang);
                      const starterCode = JSON.parse(question.starterCode);
                      setCode(starterCode[lang] || "");
                    }}
                  >
                    {lang.toUpperCase()}
                  </Button>
                ))}
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Write your code here..."
              />

              <Button
                onClick={submitCode}
                disabled={submitting || !code.trim()}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Submit & Run Tests
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Submission Results</CardTitle>
                  <Badge className={getStatusBadgeColor(result.summary.status)}>
                    {formatStatus(result.summary.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="text-sm font-semibold">
                      Test Cases Passed
                    </div>
                    <div className="text-2xl font-bold">
                      {result.summary.passedTestCases}/
                      {result.summary.totalTestCases}
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="text-sm font-semibold">Success Rate</div>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        (result.summary.passedTestCases /
                          result.summary.totalTestCases) *
                          100,
                      )}
                      %
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Test Case Details</h3>
                  {result.results.map((testResult, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-md mb-2 ${
                        testResult.passed ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">
                          Test Case {idx + 1}
                        </span>
                        <Badge
                          className={
                            testResult.passed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {testResult.passed ? "PASSED" : "FAILED"}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Input:</strong> {testResult.input}
                        </div>
                        <div>
                          <strong>Expected:</strong> {testResult.expectedOutput}
                        </div>
                        <div>
                          <strong>Got:</strong>{" "}
                          {testResult.actualOutput || "(no output)"}
                        </div>
                        {testResult.stderr && (
                          <div className="text-red-600">
                            <strong>Error:</strong> {testResult.stderr}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {result.summary.allPassed && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                    <div className="text-2xl mb-2">🎉</div>
                    <div className="font-semibold text-green-800">
                      Congratulations! All test cases passed!
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Your progress has been updated.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
