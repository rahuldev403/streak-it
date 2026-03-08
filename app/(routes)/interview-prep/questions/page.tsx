"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, CircleSlash } from "lucide-react";
import { CourseStyleLoader } from "@/components/ui/course-style-loader";

type FilterType = "all" | "solved" | "unsolved";

type CategoryFilter = "all" | "dsa" | "dbms" | "oops" | "os" | "networking";

interface QuestionItem {
  id: number;
  type: "dsa" | "cs";
  category: string;
  title: string;
  difficulty: string;
  generatedAt: string;
  solved: boolean;
  attempts: number;
  lastSubmittedAt: string | null;
}

interface ApiResponse {
  success: boolean;
  questions: QuestionItem[];
  summary: {
    total: number;
    solved: number;
    unsolved: number;
    solveRate: number;
  };
  byCategory: Record<
    string,
    { total: number; solved: number; unsolved: number }
  >;
}

const CATEGORY_ORDER: CategoryFilter[] = [
  "all",
  "dsa",
  "dbms",
  "oops",
  "os",
  "networking",
];

function formatDate(isoDate: string | null) {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function getQuestionHref(item: QuestionItem) {
  if (item.type === "dsa") {
    return "/interview-prep/dsa";
  }

  const category = item.category === "networking" ? "network" : item.category;
  return `/interview-prep/cs-fundamentals/${category}`;
}

export default function AllInterviewQuestionsPage() {
  const QUESTIONS_PER_PAGE = 10;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>(
          "/api/interview-prep/questions",
        );
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch question overview", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const filteredQuestions = useMemo(() => {
    if (!data?.questions) return [];

    return data.questions.filter((question) => {
      if (statusFilter === "solved" && !question.solved) return false;
      if (statusFilter === "unsolved" && question.solved) return false;
      if (categoryFilter !== "all" && question.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [data?.questions, statusFilter, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE),
  );

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const end = start + QUESTIONS_PER_PAGE;
    return filteredQuestions.slice(start, end);
  }, [filteredQuestions, currentPage]);

  const startIndex =
    filteredQuestions.length === 0
      ? 0
      : (currentPage - 1) * QUESTIONS_PER_PAGE + 1;
  const endIndex = Math.min(
    currentPage * QUESTIONS_PER_PAGE,
    filteredQuestions.length,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-[70vh] flex items-center justify-center">
        <div className="border-4 border-black dark:border-white px-6 py-4 bg-white dark:bg-gray-900 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
          <CourseStyleLoader
            message="Loading question history..."
            className="py-0"
            spinnerClassName="h-12 w-12"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-game font-normal text-black dark:text-white">
            All Generated Questions
          </h1>
          <p className="text-muted-foreground font-comfortaa mt-1">
            Track DSA + CS fundamentals generation and solve status in one
            place.
          </p>
        </div>
        <Button
          onClick={() => router.push("/interview-prep")}
          variant="outline"
          className="gap-2 border-4 border-black dark:border-white font-game font-normal rounded shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Interview Prep
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-4 border-black dark:border-white rounded bg-blue-50 dark:bg-blue-950 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
          <CardHeader className="pb-2">
            <CardDescription className="font-comfortaa text-gray-700 dark:text-gray-300">
              Total Generated
            </CardDescription>
            <CardTitle className="text-3xl font-game font-normal">
              {data?.summary.total || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-4 border-black dark:border-white rounded bg-green-50 dark:bg-green-950 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
          <CardHeader className="pb-2">
            <CardDescription className="font-comfortaa text-gray-700 dark:text-gray-300">
              Solved
            </CardDescription>
            <CardTitle className="text-3xl font-game font-normal text-green-600">
              {data?.summary.solved || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-4 border-black dark:border-white rounded bg-amber-50 dark:bg-amber-950 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
          <CardHeader className="pb-2">
            <CardDescription className="font-comfortaa text-gray-700 dark:text-gray-300">
              Unsolved
            </CardDescription>
            <CardTitle className="text-3xl font-game font-normal text-amber-600">
              {data?.summary.unsolved || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-4 border-black dark:border-white rounded bg-purple-50 dark:bg-purple-950 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
          <CardHeader className="pb-2">
            <CardDescription className="font-comfortaa text-gray-700 dark:text-gray-300">
              Solve Rate
            </CardDescription>
            <CardTitle className="text-3xl font-game font-normal">
              {data?.summary.solveRate || 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-4 border-black dark:border-white rounded mb-6 bg-white dark:bg-gray-900 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
        <CardHeader>
          <CardTitle className="text-lg font-game font-normal">
            Category Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORY_ORDER.filter((c) => c !== "all").map((category) => {
            const stats = data?.byCategory?.[category] || {
              total: 0,
              solved: 0,
              unsolved: 0,
            };
            return (
              <div
                key={category}
                className="rounded border-2 border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800"
              >
                <p className="font-game text-sm uppercase">{category}</p>
                <p className="text-xl font-game font-normal">{stats.total}</p>
                <p className="text-xs text-muted-foreground font-comfortaa">
                  {stats.solved} solved / {stats.unsolved} unsolved
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-4 border-black dark:border-white rounded bg-white dark:bg-gray-900 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg font-game font-normal">
              Question List
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className="font-game border-2 border-black dark:border-white"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "solved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("solved")}
                className="font-game border-2 border-black dark:border-white"
              >
                Solved
              </Button>
              <Button
                variant={statusFilter === "unsolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("unsolved")}
                className="font-game border-2 border-black dark:border-white"
              >
                Unsolved
              </Button>
              <select
                className="h-9 rounded-md border-2 border-black dark:border-white bg-background px-3 text-sm font-game"
                value={categoryFilter}
                aria-label="Filter by category"
                title="Filter by category"
                onChange={(e) =>
                  setCategoryFilter(e.target.value as CategoryFilter)
                }
              >
                {CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between gap-2 text-xs sm:text-sm font-comfortaa text-muted-foreground">
            <span>
              Showing {startIndex}-{endIndex} of {filteredQuestions.length}
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground font-comfortaa">
              No questions match the selected filters.
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedQuestions.map((question) => (
                <div
                  key={`${question.type}-${question.id}`}
                  className="rounded border-2 border-black dark:border-white p-4 bg-gray-50 dark:bg-gray-800 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="uppercase">
                          {question.type}
                        </Badge>
                        <Badge variant="secondary" className="uppercase">
                          {question.category}
                        </Badge>
                        <Badge
                          className={
                            question.difficulty === "easy"
                              ? "bg-green-600"
                              : question.difficulty === "medium"
                                ? "bg-yellow-500 text-black"
                                : "bg-red-600"
                          }
                        >
                          {question.difficulty}
                        </Badge>
                        {question.solved ? (
                          <Badge className="bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Solved
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <CircleSlash className="h-3 w-3 mr-1" /> Unsolved
                          </Badge>
                        )}
                      </div>
                      <p className="font-comfortaa font-semibold leading-snug">
                        {question.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-comfortaa">
                        Generated: {formatDate(question.generatedAt)} |
                        Attempts: {question.attempts} | Last submission:{" "}
                        {formatDate(question.lastSubmittedAt)}
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push(getQuestionHref(question))}
                      className="font-game border-2 border-black dark:border-white"
                    >
                      Open Practice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredQuestions.length > 0 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="font-game border-2 border-black dark:border-white"
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2),
                )
                .map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="font-game border-2 border-black dark:border-white min-w-9"
                  >
                    {page}
                  </Button>
                ))}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="font-game border-2 border-black dark:border-white"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
