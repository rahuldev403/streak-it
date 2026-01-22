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
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Lightbulb,
  ArrowLeft,
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
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No questions available. Please generate questions first.</p>
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
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/interview-prep")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Interview Prep
        </Button>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{categoryNames[category]}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">
              {categoryNames[category]}
            </CardTitle>
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
          <CardDescription>
            Question {currentIndex + 1} of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-lg font-medium">{currentQuestion.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedAnswer === optionLabel;
              const isCorrect = result && optionLabel === result.correctAnswer;
              const isWrong = result && isSelected && !result.isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => !submitted && setSelectedAnswer(optionLabel)}
                  disabled={submitted}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : isWrong
                        ? "border-red-500 bg-red-50 dark:bg-red-950"
                        : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-800"
                  } ${submitted ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        isCorrect
                          ? "bg-green-500 text-white"
                          : isWrong
                            ? "bg-red-500 text-white"
                            : isSelected
                              ? "bg-primary text-white"
                              : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {optionLabel}
                    </div>
                    <span className="flex-1">{option}</span>
                    {isCorrect && <Check className="h-5 w-5 text-green-600" />}
                    {isWrong && <X className="h-5 w-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {result && (
            <div
              className={`p-4 rounded-lg border-2 ${
                result.isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-red-500 bg-red-50 dark:bg-red-950"
              }`}
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-2">Explanation:</p>
                  <p className="text-sm">{result.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
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
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
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
  );
}
