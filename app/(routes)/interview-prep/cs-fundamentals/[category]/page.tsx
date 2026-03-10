"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CourseStyleLoader } from "@/components/ui/course-style-loader";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Lightbulb,
  ArrowLeft,
  Trophy,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { CsFundamentalsQuestion } from "@/types/cs-fundamentals";

export default function CsFundamentalsPracticePage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  const [questions, setQuestions] = useState<CsFundamentalsQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(),
  );

  const categoryNames: Record<string, string> = {
    dbms: "Database Management Systems",
    os: "Operating Systems",
    network: "Computer Networks",
    oops: "Object-Oriented Programming",
  };

  const categoryStyles: Record<
    string,
    {
      badge: string;
      glow: string;
      panel: string;
      label: string;
    }
  > = {
    dbms: {
      badge: "bg-cyan-500 text-white",
      glow: "from-cyan-400/30 via-sky-400/15 to-transparent",
      panel: "from-cyan-50 to-sky-50 dark:from-cyan-950/60 dark:to-sky-950/60",
      label: "DATA LAYER",
    },
    os: {
      badge: "bg-emerald-500 text-white",
      glow: "from-emerald-400/30 via-lime-400/15 to-transparent",
      panel:
        "from-emerald-50 to-lime-50 dark:from-emerald-950/60 dark:to-lime-950/60",
      label: "KERNEL CORE",
    },
    network: {
      badge: "bg-indigo-500 text-white",
      glow: "from-indigo-400/30 via-violet-400/15 to-transparent",
      panel:
        "from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60",
      label: "PACKET GRID",
    },
    oops: {
      badge: "bg-amber-500 text-black",
      glow: "from-amber-400/30 via-orange-400/15 to-transparent",
      panel:
        "from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/60",
      label: "OBJECT ARENA",
    },
  };

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user, category]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/cs-fundamentals/questions", {
        params: { userId: user?.id, category },
      });

      if (response.data.questions.length === 0) {
        toast.info("No questions found. Generate some questions first!");
        router.push("/interview-prep");
        return;
      }

      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !user) return;

    try {
      const response = await axios.post("/api/cs-fundamentals/submit", {
        userId: user.id,
        questionId: questions[currentIndex].id,
        selectedAnswer,
      });

      setResult({
        isCorrect: response.data.isCorrect,
        correctAnswer: response.data.correctAnswer,
        explanation: response.data.explanation,
      });
      setSubmitted(true);
      setAnsweredQuestions(new Set(answeredQuestions).add(currentIndex));

      if (response.data.isCorrect) {
        toast.success("Correct! 🎉");
      } else {
        toast.error("Incorrect. Review the explanation.");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetQuestion();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetQuestion();
    }
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.2),transparent_40%),radial-gradient(circle_at_90%_15%,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.2),transparent_45%)]" />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen relative">
          <div className="border-4 border-black dark:border-white bg-white/90 dark:bg-gray-900/85 px-8 py-7 rounded-xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
            <CourseStyleLoader
              message="Loading questions..."
              className="py-0"
            />
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-4 border-black dark:border-white rounded-xl bg-white/90 dark:bg-gray-900/85 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="font-comfortaa text-base">
              No questions available. Please generate questions first.
            </p>
            <Button
              onClick={() => router.push("/interview-prep")}
              variant="pixel"
              className="mt-2"
            >
              Go to Interview Prep
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const solvedCount = answeredQuestions.size;
  const stylePack = categoryStyles[category] || categoryStyles.dbms;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className={`absolute inset-0 bg-linear-to-b ${stylePack.glow} pointer-events-none`}
      />
      <div className="container mx-auto p-4 md:p-6 max-w-5xl relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <Button
            variant="pixel"
            onClick={() => router.push("/interview-prep")}
            className="gap-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Prep
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="px-3 py-1 font-game font-normal bg-black text-white dark:bg-white dark:text-black">
              QUESTION {currentIndex + 1} / {questions.length}
            </Badge>
            <Badge
              className={`px-3 py-1 font-game font-normal ${stylePack.badge}`}
            >
              {stylePack.label}
            </Badge>
          </div>
        </div>

        <Card
          className={`mb-5 border-4 border-black dark:border-white rounded-xl bg-linear-to-r ${stylePack.panel} shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]`}
        >
          <CardContent className="pt-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs font-game text-muted-foreground">
                  CATEGORY
                </p>
                <h2 className="text-xl md:text-2xl font-game font-normal">
                  {categoryNames[category]}
                </h2>
              </div>
              <div className="flex gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-black/20 dark:border-white/20 bg-white/80 dark:bg-gray-900/70">
                  <Target className="h-4 w-4" />
                  <span className="font-comfortaa">
                    Progress {Math.round(progress)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-black/20 dark:border-white/20 bg-white/80 dark:bg-gray-900/70">
                  <Trophy className="h-4 w-4" />
                  <span className="font-comfortaa">Solved {solvedCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="font-comfortaa">Question flow</span>
                <span className="font-game">{Math.round(progress)}%</span>
              </div>
              <Progress
                value={progress}
                className="h-3 border border-black/30 dark:border-white/30"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    resetQuestion();
                  }}
                  className={`h-7 min-w-7 px-2 text-xs font-game border-2 transition-all ${
                    idx === currentIndex
                      ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
                      : answeredQuestions.has(idx)
                        ? "border-emerald-600 bg-emerald-100 dark:bg-emerald-950"
                        : "border-black/30 dark:border-white/30 bg-white/80 dark:bg-gray-900/70"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-4 border-black dark:border-white rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-[10px_10px_0_0_#000] dark:shadow-[10px_10px_0_0_#fff]">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-3">
              <CardTitle className="text-lg md:text-2xl font-game font-normal">
                {categoryNames[category]}
              </CardTitle>
              <Badge
                className={
                  currentQuestion.difficulty === "easy"
                    ? "bg-green-500 text-white"
                    : currentQuestion.difficulty === "medium"
                      ? "bg-yellow-400 text-black"
                      : "bg-red-500 text-white"
                }
              >
                {currentQuestion.difficulty.toUpperCase()}
              </Badge>
            </div>
            <CardDescription className="font-comfortaa">
              Question {currentIndex + 1} of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`rounded-xl border-2 border-black/20 dark:border-white/20 p-4 md:p-5 bg-linear-to-r ${stylePack.panel}`}
            >
              <p className="text-base md:text-lg font-comfortaa font-bold leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedAnswer === optionLabel;
                const isCorrect =
                  result && optionLabel === result.correctAnswer;
                const isWrong = result && isSelected && !result.isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => !submitted && setSelectedAnswer(optionLabel)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isCorrect
                        ? "border-green-500 bg-green-100/80 dark:bg-green-950/70"
                        : isWrong
                          ? "border-red-500 bg-red-100/80 dark:bg-red-950/70"
                          : isSelected
                            ? "border-black dark:border-white bg-black/10 dark:bg-white/10"
                            : "border-black/20 dark:border-white/20 bg-white dark:bg-gray-950 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] dark:hover:shadow-[4px_4px_0_0_#fff]"
                    } ${submitted ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-md border-2 border-black/40 dark:border-white/40 flex items-center justify-center font-game ${
                          isCorrect
                            ? "bg-green-500 text-white"
                            : isWrong
                              ? "bg-red-500 text-white"
                              : isSelected
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        {optionLabel}
                      </div>
                      <span className="flex-1 font-comfortaa text-sm md:text-base">
                        {option}
                      </span>
                      {isCorrect && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                      {isWrong && <X className="h-5 w-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {result && (
              <div
                className={`p-4 rounded-xl border-2 ${
                  result.isCorrect
                    ? "border-green-500 bg-green-100/80 dark:bg-green-950/70"
                    : "border-red-500 bg-red-100/80 dark:bg-red-950/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 mt-1 shrink-0" />
                  <div>
                    <p className="font-game mb-2">Explanation:</p>
                    <p className="text-sm font-comfortaa leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  variant="pixel"
                  className="flex-1"
                >
                  Submit Answer
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    variant="outline"
                    className="gap-2 border-2 border-black dark:border-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
                    variant="pixel"
                    className="flex-1 gap-2"
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
