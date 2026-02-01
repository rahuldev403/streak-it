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
  Send,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

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
    const starterCode =
      typeof question.starterCode === "string"
        ? JSON.parse(question.starterCode)
        : question.starterCode;
    setShowResults(false);
    setCode(starterCode[language] || "");
    setResult(null);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (questions.length > 0) {
      const starterCode =
        typeof questions[currentIndex].starterCode === "string"
          ? JSON.parse(questions[currentIndex].starterCode)
          : questions[currentIndex].starterCode;
      setCode(starterCode[newLang] || "");
    }
  };

  const handleRun = async () => {
    if (!user) return;

    setRunning(true);
    setShowResults(true);
    try {
      const response = await axios.post("/api/dsa/submit-code", {
        userId: user.id,
        questionId: questions[currentIndex].id,
        code,
        language,
      });

      setResult(response.data);

      if (response.data.summary.allPassed) {
        toast.success("All test cases passed!");
      } else {
        toast.info(
          `${response.data.summary.passedTestCases}/${response.data.summary.totalTestCases} test cases passed`,
        );
      }
    } catch (error: any) {
      console.error("Error running code:", error);
      const errorMessage = error.response?.data?.error || "Failed to run code";
      setResult({
        summary: { allPassed: false, passedTestCases: 0, totalTestCases: 0 },
        results: [],
        error: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    setShowResults(true);
    try {
      const response = await axios.post("/api/dsa/submit-code", {
        userId: user.id,
        questionId: questions[currentIndex].id,
        code,
        language,
      });

      setResult(response.data);

      if (response.data.summary.allPassed) {
        toast.success("Solution accepted! Question completed!");
      } else {
        toast.error(
          `${response.data.summary.passedTestCases}/${response.data.summary.totalTestCases} test cases passed`,
        );
      }
    } catch (error: any) {
      console.error("Error submitting code:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to submit code";
      setResult({
        summary: { allPassed: false, passedTestCases: 0, totalTestCases: 0 },
        results: [],
        error: errorMessage,
      });
      toast.error(`Error: ${error}`);
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
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading questions...</p>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const examples =
    typeof currentQuestion.examples === "string"
      ? JSON.parse(currentQuestion.examples)
      : currentQuestion.examples;
  const hints = currentQuestion.hints
    ? typeof currentQuestion.hints === "string"
      ? JSON.parse(currentQuestion.hints)
      : currentQuestion.hints
    : [];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Sub Header */}
      <div className="border-b border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="pixel"
            size="sm"
            onClick={() => router.push("/interview-prep")}
            className="gap-2 font-game"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="pixel"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="font-game"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge
              variant="default"
              className="px-4 font-game border-2 border-gray-800"
            >
              {currentIndex + 1} / {questions.length}
            </Badge>
            <Button
              variant="pixel"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="font-game"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {languages.map((lang) => (
            <Button
              key={lang.id}
              variant={language === lang.id ? "pixel" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange(lang.id)}
              className={`font-game ${language === lang.id ? "bg-purple-600 text-white" : ""}`}
            >
              {lang.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Allotment>
          {/* Left Panel - Problem Description */}
          <Allotment.Pane minSize={300}>
            <div className="h-full flex flex-col bg-white dark:bg-gray-900">
              {/* Question Content - Scrollable */}
              <div
                className={`overflow-y-auto p-6 transition-all duration-300 ${showResults ? "h-[50%]" : "h-full"}`}
              >
                <div className="max-w-3xl">
                  {/* Title and Difficulty */}
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl font-normal font-game">
                      {currentQuestion.title}
                    </h1>
                    <Badge
                      className={`font-game border-2 border-gray-800 ${
                        currentQuestion.difficulty === "easy"
                          ? "bg-green-500 text-white"
                          : currentQuestion.difficulty === "medium"
                            ? "bg-yellow-500 text-black"
                            : "bg-red-500 text-white"
                      }`}
                    >
                      {currentQuestion.difficulty.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Category and Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge
                      variant="outline"
                      className="font-game border-2 border-gray-800"
                    >
                      {currentQuestion.category}
                    </Badge>
                    {currentQuestion.tags &&
                      JSON.parse(currentQuestion.tags).map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="font-game border border-gray-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="text-lg font-normal mb-2 font-game">
                      Problem Statement
                    </h2>
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {currentQuestion.description}
                    </p>
                  </div>

                  {/* Examples */}
                  <div className="mb-6">
                    <h2 className="text-lg font-normal mb-2 font-game">
                      Examples
                    </h2>
                    {examples.map((example: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-lg mb-3 border-2 border-gray-800"
                      >
                        <div className="text-sm space-y-1">
                          <div>
                            <strong className="font-game">Input:</strong>{" "}
                            <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
                              {example.input}
                            </code>
                          </div>
                          <div>
                            <strong className="font-game">Output:</strong>{" "}
                            <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div className="text-muted-foreground mt-2">
                              <strong className="font-game">
                                Explanation:
                              </strong>{" "}
                              {example.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  {currentQuestion.constraints && (
                    <div className="mb-6">
                      <h2 className="text-lg font-normal mb-2 font-game">
                        ⚠️ Constraints
                      </h2>
                      <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap border-2 border-gray-800">
                        {currentQuestion.constraints}
                      </pre>
                    </div>
                  )}

                  {/* Hints */}
                  {hints.length > 0 && (
                    <details className="mb-6">
                      <summary className="text-lg font-normal cursor-pointer font-game">
                        Hints
                      </summary>
                      <ul className="mt-3 space-y-2 ml-4 list-disc">
                        {hints.map((hint: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {/* Complexity */}
                  {(currentQuestion.timeComplexity ||
                    currentQuestion.spaceComplexity) && (
                    <div className="bg-blue-100 dark:bg-blue-950 p-4 rounded-lg border-2 border-gray-800">
                      <h2 className="text-lg font-normal mb-2 font-game">
                        Expected Complexity
                      </h2>
                      <div className="text-sm space-y-1">
                        {currentQuestion.timeComplexity && (
                          <div>
                            <strong className="font-game">Time:</strong>{" "}
                            {currentQuestion.timeComplexity}
                          </div>
                        )}
                        {currentQuestion.spaceComplexity && (
                          <div>
                            <strong className="font-game">Space:</strong>{" "}
                            {currentQuestion.spaceComplexity}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Results Panel - Slides up from bottom */}
              {showResults && (
                <div className="h-[50%] border-t-4 border-gray-800 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 overflow-y-auto animate-slide-up">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-normal text-lg font-game">
                        Test Results
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowResults(false)}
                        className="font-game"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {result?.error ? (
                      <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg border-2 border-red-600">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-300 mt-0.5" />
                          <div>
                            <h4 className="font-normal text-red-800 dark:text-red-200 font-game">
                              Error
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                              {result.error}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : result ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <Badge
                            className={`text-lg px-4 py-2 font-game border-2 border-gray-800 ${
                              result.summary.allPassed
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {result.summary.passedTestCases}/
                            {result.summary.totalTestCases} Passed
                          </Badge>
                        </div>

                        {result.summary.allPassed && (
                          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center mb-4 border-2 border-green-600">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-300" />
                            <p className="font-normal text-green-800 dark:text-green-200 font-game text-lg">
                              All test cases passed!
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          {result.results.map((test: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border-2 ${
                                test.passed
                                  ? "bg-green-50 dark:bg-green-950 border-green-600"
                                  : "bg-red-50 dark:bg-red-950 border-red-600"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-normal font-game flex items-center gap-2">
                                  {test.passed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  Test Case {idx + 1}
                                </span>
                                <Badge
                                  variant={
                                    test.passed ? "default" : "destructive"
                                  }
                                  className="text-xs font-game border border-gray-800"
                                >
                                  {test.passed ? "PASSED" : "FAILED"}
                                </Badge>
                              </div>
                              <div className="text-xs space-y-1 font-mono">
                                <div className="bg-white dark:bg-gray-800 p-2 rounded">
                                  <strong className="font-game">Input:</strong>{" "}
                                  {test.input}
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded">
                                  <strong className="font-game">
                                    Expected:
                                  </strong>{" "}
                                  {test.expectedOutput}
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded">
                                  <strong className="font-game">Got:</strong>{" "}
                                  {test.actualOutput || "(no output)"}
                                </div>
                                {test.stderr && (
                                  <div className="bg-red-100 dark:bg-red-900 p-2 rounded mt-1">
                                    <strong className="font-game text-red-800 dark:text-red-200">
                                      Error:
                                    </strong>
                                    <pre className="text-xs mt-1 whitespace-pre-wrap">
                                      {test.stderr}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </Allotment.Pane>

          {/* Right Panel - Code Editor */}
          <Allotment.Pane minSize={400}>
            <div className="h-full flex flex-col bg-gray-900">
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

              {/* Action Buttons */}
              <div className="border-t-4 border-gray-800 p-4 bg-white dark:bg-gray-900">
                <div className="flex gap-3">
                  <Button
                    onClick={handleRun}
                    disabled={running || submitting || !code.trim()}
                    className="flex-1 font-game font-normal"
                    variant="pixel"
                    size="lg"
                  >
                    {running ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Code
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || running || !code.trim()}
                    className="flex-1 font-game font-normal bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    variant="pixel"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}
