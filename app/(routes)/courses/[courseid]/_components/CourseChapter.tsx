"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Play } from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: number;
  courseId: string;
  name: string;
  desc: string;
  exercise: string | null;
}

type Props = {
  loading?: boolean;
  chapters: Chapter[];
  chaptersLoading?: boolean;
  chaptersError?: string | null;
  onRetryChapters?: () => void;
  isEnrolled?: boolean;
  completedExercises?: number;
  onCompleteChapter?: (chapterIndex: number) => Promise<void> | void;
  courseId: string;
};

const CourseChapter = ({
  loading,
  chapters,
  chaptersLoading,
  chaptersError,
  onRetryChapters,
  isEnrolled,
  completedExercises = 0,
  onCompleteChapter,
  courseId,
}: Props) => {
  const [completingChapter, setCompletingChapter] = useState<number | null>(
    null
  );

  const handlePlayChapter = (chapterId: number, chapterName: string) => {
    // TODO: Implement video player or chapter content display
  };

  const handleCompleteClick = async (chapterIndex: number) => {
    if (!onCompleteChapter) return;
    try {
      setCompletingChapter(chapterIndex);
      await onCompleteChapter(chapterIndex);
    } finally {
      setCompletingChapter(null);
    }
  };

  const totalChapters = chapters.length;
  const completedCount = Math.min(completedExercises, totalChapters);

  const getChapterStatus = (index: number) => {
    if (!isEnrolled) return "locked" as const;
    if (index < completedCount) return "completed" as const;
    if (index === completedCount) return "in-progress" as const;
    return "up-next" as const;
  };

  const statusStyles: Record<ReturnType<typeof getChapterStatus>, string> = {
    completed:
      "bg-green-500/20 text-green-900 dark:text-green-200 border-green-600",
    "in-progress":
      "bg-yellow-400/30 text-yellow-900 dark:text-yellow-200 border-yellow-500",
    "up-next":
      "bg-blue-400/20 text-blue-900 dark:text-blue-100 border-blue-500",
    locked:
      "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-500",
  };

  if (loading || chaptersLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 dark:border-white mb-4"></div>
        <p className="font-game text-xl">Loading chapters...</p>
      </div>
    );
  }

  if (chaptersError) {
    return (
      <div className="border-4 border-gray-800 rounded-lg p-8 bg-red-50 dark:bg-red-900/20 text-center">
        <h3 className="text-2xl font-bold font-game mb-4 text-red-800 dark:text-red-200">
          Error Loading Chapters
        </h3>
        <p className="text-red-600 dark:text-red-300">{chaptersError}</p>
        <Button
          variant="pixel"
          onClick={onRetryChapters}
          className="mt-4 font-game"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="border-4 border-gray-800 rounded-lg p-8 bg-white dark:bg-gray-800 text-center">
        <h3 className="text-2xl font-bold font-game mb-4">
          No Chapters Available
        </h3>
        <p className="text-muted-foreground">
          This course doesn&apos;t have any chapters yet. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div id="course-chapters" className="space-y-6">
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 border-4 border-gray-800 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] max-h-210 overflow-y-auto">
        <h2 className="text-3xl font-bold font-game mb-6">Course Chapters</h2>

        <Accordion type="single" collapsible className="space-y-4">
          {chapters.map((chapter, index) => {
            const status = getChapterStatus(index);
            const statusLabel =
              status === "completed"
                ? "Completed"
                : status === "in-progress"
                ? "In Progress"
                : status === "up-next"
                ? "Up Next"
                : "Locked";
            const isLockedState =
              !isEnrolled || status === "locked" || status === "up-next";
            const isCurrent = status === "in-progress";
            const isCompleted = status === "completed";

            return (
              <AccordionItem
                key={chapter.id}
                value={`item-${chapter.id}`}
                className="border-4 border-gray-800 rounded-none bg-white dark:bg-gray-800 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-game text-lg font-bold text-left hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]">
                  <div className="flex items-center gap-4">
                    <span className="bg-black text-white dark:bg-white dark:text-black rounded-none w-10 h-10 flex items-center justify-center text-lg font-bold border-2 border-gray-800 shadow-[2px_2px_0_0_#666]">
                      {index + 1}
                    </span>
                    <span className="text-black dark:text-white">
                      {chapter.name}
                    </span>
                    <span
                      className={`text-xs font-mono border px-2 py-0.5 rounded-none ${statusStyles[status]}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4 pt-4 border-t-4 border-gray-800 border-dashed">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {chapter.desc}
                      </p>
                    </div>

                    {chapter.exercise && (
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 border-4 border-yellow-500 rounded-none p-4 shadow-[4px_4px_0_0_#d97706]">
                        <h4 className="font-bold font-game text-yellow-800 dark:text-yellow-200 mb-2 text-lg">
                          💪 Exercise Challenge
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-mono">
                          {chapter.exercise}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4 flex-wrap">
                      {!isLockedState ? (
                        <>
                          <Link href={`/courses/${courseId}/${chapter.name}`}>
                            <Button
                              variant="pixel"
                              onClick={() =>
                                handlePlayChapter(chapter.id, chapter.name)
                              }
                              className="font-game border-4 border-gray-800 shadow-[4px_4px_0_0_#111]"
                            >
                              <Play className="w-5 h-5 mr-2" /> Start Chapter
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="font-game border-4 border-gray-800 rounded-none shadow-[4px_4px_0_0_#111]"
                          >
                            Notes
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleCompleteClick(index)}
                            disabled={
                              isCompleted ||
                              completingChapter === index ||
                              !isCurrent
                            }
                            className="font-game border-4 border-gray-800 rounded-none shadow-[4px_4px_0_0_#111] min-w-40"
                          >
                            {completingChapter === index ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : isCompleted ? (
                              "Completed"
                            ) : (
                              "Mark Complete"
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                tabIndex={0}
                                aria-disabled="true"
                                className="inline-flex"
                              >
                                <Button
                                  variant="pixel"
                                  disabled
                                  className="font-game text-gray-500 bg-gray-300 dark:bg-gray-700 dark:text-gray-400 border-4 border-gray-400 dark:border-gray-600 shadow-[4px_4px_0_0_#9ca3af] cursor-not-allowed opacity-60"
                                >
                                  <Play className="w-5 h-5 mr-2 fill-current" />
                                  Start Chapter
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {isEnrolled
                                  ? "Complete the previous chapter to unlock this one"
                                  : "Enroll to unlock this chapter"}
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                tabIndex={0}
                                aria-disabled="true"
                                className="inline-flex"
                              >
                                <Button
                                  variant="pixel"
                                  disabled
                                  className="font-game text-gray-500 bg-gray-300 dark:bg-gray-700 dark:text-gray-400 border-4 border-gray-400 dark:border-gray-600 shadow-[4px_4px_0_0_#9ca3af] cursor-not-allowed opacity-60"
                                >
                                  Read Notes
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {isEnrolled
                                  ? "Complete the previous chapter to unlock this one"
                                  : "Enroll to unlock this chapter"}
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                tabIndex={0}
                                aria-disabled="true"
                                className="inline-flex"
                              >
                                <Button
                                  variant="pixel"
                                  disabled
                                  className="font-game text-gray-500 bg-gray-300 dark:bg-gray-700 dark:text-gray-400 border-4 border-gray-400 dark:border-gray-600 shadow-[4px_4px_0_0_#9ca3af] cursor-not-allowed opacity-60"
                                >
                                  Mark Complete
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {isEnrolled
                                  ? "Complete the previous chapter to unlock this one"
                                  : "Enroll to unlock this chapter"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>

                    <div className="mt-2 p-3 border-2 rounded-none bg-orange-100 dark:bg-orange-900/30 border-orange-400">
                      <p className="text-xs font-mono">
                        {isEnrolled
                          ? completedCount >= totalChapters
                            ? "🏁 You finished every chapter in this course!"
                            : `✨ ${
                                totalChapters - completedCount
                              } chapters left. Keep going!`
                          : "🔒 Enroll to unlock chapter content."}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default CourseChapter;
