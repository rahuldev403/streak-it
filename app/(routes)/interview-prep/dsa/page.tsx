"use client";

import { useState, useEffect } from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Play,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { DsaQuestion } from "@/types/dsa";

export default function DsaPracticePage() {
  const { user } = useUser();
  const router = useRouter();

  const [questions, setQuestions] = useState<DsaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const languages = [
    { id: "python", name: "Python" },
    { id: "javascript", name: "JavaScript" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
  ];

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/dsa/questions", {
        params: { userId: user?.id },
      });

      if (response.data.questions.length === 0) {
        toast.info("No DSA questions found. Generate some questions first!");
        router.push("/interview-prep");
        return;
      }

      setQuestions(response.data.questions);
      loadQuestion(response.data.questions[0]);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestion = (question: DsaQuestion) => {
    const starterCode = JSON.parse(question.starterCode);
    setCode(starterCode[language] || "");
    setResult(null);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (questions.length > 0) {
      const starterCode = JSON.parse(questions[currentIndex].starterCode);
      setCode(starterCode[newLang] || "");
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const response = await axios.post("/api/dsa/submit-code", {
        userId: user.id,
        questionId: questions[currentIndex].id,
        code,
        language,
      });

      setResult(response.data);

      if (response.data.summary.allPassed) {
        toast.success("All test cases passed! 🎉");
      } else {
        toast.error(
          `${response.data.summary.passedTestCases}/${response.data.summary.totalTestCases} test cases passed`,
        );
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      toast.error("Failed to submit code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      loadQuestion(questions[newIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      loadQuestion(questions[newIndex]);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No DSA questions available. Please generate questions first.</p>
            <Button
              onClick={() => router.push("/interview-prep")}
              className="mt-4"
            >
              Go to Interview Prep
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const examples = JSON.parse(currentQuestion.examples);
  const hints = currentQuestion.hints ? JSON.parse(currentQuestion.hints) : [];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/interview-prep")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="secondary" className="px-4">
              {currentIndex + 1} / {questions.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {languages.map((lang) => (
            <Button
              key={lang.id}
              variant={language === lang.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange(lang.id)}
            >
              {lang.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Split Screen */}
      <div className="flex-1 overflow-hidden">
        <Allotment>
          {/* Left Panel - Problem Description */}
          <Allotment.Pane minSize={300}>
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-3xl">
                {/* Title and Difficulty */}
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold">
                    {currentQuestion.title}
                  </h1>
                  <Badge
                    className={
                      currentQuestion.difficulty === "easy"
                        ? "bg-green-500"
                        : currentQuestion.difficulty === "medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }
                  >
                    {currentQuestion.difficulty.toUpperCase()}
                  </Badge>
                </div>

                {/* Category and Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline">{currentQuestion.category}</Badge>
                  {currentQuestion.tags &&
                    JSON.parse(currentQuestion.tags).map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">
                    Problem Statement
                  </h2>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {currentQuestion.description}
                  </p>
                </div>

                {/* Examples */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Examples</h2>
                  {examples.map((example: any, idx: number) => (
                    <div key={idx} className="bg-muted p-4 rounded-lg mb-3">
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Input:</strong> <code>{example.input}</code>
                        </div>
                        <div>
                          <strong>Output:</strong> <code>{example.output}</code>
                        </div>
                        {example.explanation && (
                          <div className="text-muted-foreground mt-2">
                            <strong>Explanation:</strong> {example.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {currentQuestion.constraints && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Constraints</h2>
                    <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                      {currentQuestion.constraints}
                    </pre>
                  </div>
                )}

                {/* Hints */}
                {hints.length > 0 && (
                  <details className="mb-6">
                    <summary className="text-lg font-semibold cursor-pointer">
                      💡 Hints
                    </summary>
                    <ul className="mt-3 space-y-2 ml-4 list-disc">
                      {hints.map((hint: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* Complexity */}
                {(currentQuestion.timeComplexity ||
                  currentQuestion.spaceComplexity) && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">
                      Expected Complexity
                    </h2>
                    <div className="text-sm space-y-1">
                      {currentQuestion.timeComplexity && (
                        <div>
                          <strong>Time:</strong>{" "}
                          {currentQuestion.timeComplexity}
                        </div>
                      )}
                      {currentQuestion.spaceComplexity && (
                        <div>
                          <strong>Space:</strong>{" "}
                          {currentQuestion.spaceComplexity}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Allotment.Pane>

          {/* Right Panel - Code Editor */}
          <Allotment.Pane minSize={400}>
            <div className="h-full flex flex-col">
              {/* Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily:
                      "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
                    fontLigatures: true,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                  }}
                />
              </div>

              {/* Submit Button */}
              <div className="border-t p-4 bg-background">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                  className="w-full"
                  size="lg"
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
              </div>

              {/* Results */}
              {result && (
                <div className="border-t p-4 max-h-64 overflow-y-auto bg-muted">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Test Results</h3>
                      <Badge
                        className={
                          result.summary.allPassed
                            ? "bg-green-500"
                            : "bg-red-500"
                        }
                      >
                        {result.summary.passedTestCases}/
                        {result.summary.totalTestCases} Passed
                      </Badge>
                    </div>

                    {result.summary.allPassed && (
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          All test cases passed! 🎉
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {result.results
                        .slice(0, 3)
                        .map((test: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2 rounded text-sm ${
                              test.passed
                                ? "bg-green-50 dark:bg-green-950"
                                : "bg-red-50 dark:bg-red-950"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                Test Case {idx + 1}
                              </span>
                              <Badge
                                variant={
                                  test.passed ? "default" : "destructive"
                                }
                                className="text-xs"
                              >
                                {test.passed ? "PASSED" : "FAILED"}
                              </Badge>
                            </div>
                            {!test.passed && (
                              <div className="mt-1 text-xs space-y-1">
                                <div>Input: {test.input}</div>
                                <div>Expected: {test.expectedOutput}</div>
                                <div>
                                  Got: {test.actualOutput || "(no output)"}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}
