"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play } from "lucide-react";

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
};

const CourseChapter = ({
  loading,
  chapters,
  chaptersLoading,
  chaptersError,
  onRetryChapters,
}: Props) => {
  const handlePlayChapter = (chapterId: number, chapterName: string) => {
    // TODO: Implement video player or chapter content display
  };

  if (loading || chaptersLoading) {
    return <LoadingScreen message="Loading chapters..." size="md" />;
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
    <div className="space-y-6">
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 border-4 border-gray-800 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] max-h-210 overflow-y-auto">
        <h2 className="text-3xl font-bold font-game mb-6">Course Chapters</h2>

        <Accordion type="single" collapsible className="space-y-4">
          {chapters.map((chapter, index) => (
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

                  <div className="flex gap-4 pt-4">
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
                            onClick={() =>
                              handlePlayChapter(chapter.id, chapter.name)
                            }
                            className="font-game text-gray-500 bg-gray-300 dark:bg-gray-700 dark:text-gray-400 border-4 border-gray-400 dark:border-gray-600 shadow-[4px_4px_0_0_#9ca3af] cursor-not-allowed opacity-60"
                          >
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Start Chapter
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Complete payment to unlock this chapter</p>
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
                            onClick={() =>
                              handlePlayChapter(chapter.id, chapter.name)
                            }
                            className="font-game text-gray-500 bg-gray-300 dark:bg-gray-700 dark:text-gray-400 border-4 border-gray-400 dark:border-gray-600 shadow-[4px_4px_0_0_#9ca3af] cursor-not-allowed opacity-60"
                          >
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Read Notes
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Complete payment to unlock this chapter</p>
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
                            onClick={() =>
                              handlePlayChapter(chapter.id, chapter.name)
                            }
                            className="font-game text-gray-500 bg-gray-300 dark:bg-gray-700 dark:text-gray-400 border-4 border-gray-400 dark:border-gray-600 shadow-[4px_4px_0_0_#9ca3af] cursor-not-allowed opacity-60"
                          >
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Mark Complete
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Complete payment to unlock this chapter</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="mt-2 p-3 bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 rounded-none">
                    <p className="text-xs text-orange-700 dark:text-orange-300 font-mono">
                      🔒 Complete payment to unlock chapters
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CourseChapter;
