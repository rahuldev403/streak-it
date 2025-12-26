"use client";
import { Target, PartyPopper, Flame } from "lucide-react";
import Image from "next/image";
import progress from "@/public/roadmap.png";
import flame from "@/public/fire.png";
interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
  bannerImage: string;
  level: string;
  tags: string;
  enrolledCourse?: {
    enrolledDate: string;
  } | null;
}

interface Chapter {
  id: number;
  courseId: string;
  name: string;
  desc: string;
  exercise: string | null;
}

type Props = {
  loading?: boolean;
  chaptersLoading?: boolean;
  courseDetail?: Course | null;
  chapters: Chapter[];
  isEnrolled?: boolean;
  completedExercises?: number;
};

const CourseStatus = ({
  loading,
  chaptersLoading,
  courseDetail,
  chapters,
  isEnrolled,
  completedExercises = 0,
}: Props) => {
  const chaptersWithExercises = chapters.filter((chapter) =>
    Boolean(chapter.exercise && chapter.exercise.trim().length)
  );
  const totalExercises = chaptersWithExercises.length || chapters.length;
  const totalChapters = chapters.length;
  const safeCompleted = Math.min(completedExercises, totalExercises);
  const progressPercent = totalExercises
    ? Math.round((safeCompleted / totalExercises) * 100)
    : 0;

  const isLoading = loading || chaptersLoading;
  const statusMessage = !isEnrolled
    ? "Enroll to unlock exercises and track your progress."
    : safeCompleted >= totalExercises
    ? "completed"
    : "progress";
  const enrolledDate = courseDetail?.enrolledCourse?.enrolledDate
    ? new Date(courseDetail.enrolledCourse.enrolledDate).toLocaleDateString()
    : null;

  return (
    <div>
      <div className="p-4 sm:p-6 bg-gray-200 dark:bg-gray-800 border-4 border-gray-800 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] min-h-60 sm:min-h-80 rounded-md">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Image src={progress} alt="Progress" width={24} height={24} />
          <h3 className="font-bold font-game font-normal text-lg sm:text-xl md:text-2xl text-black dark:text-white">
            Course Progress
          </h3>
        </div>

        <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 font-comfortaa flex items-center gap-2">
          {isLoading ? (
            "Syncing your chapters..."
          ) : statusMessage === "completed" ? (
            <>
              <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              You completed every exercise! Grab your badge.
            </>
          ) : statusMessage === "progress" ? (
            <>
              <Image src={flame} alt="Progress" width={20} height={20} />
              {totalExercises - safeCompleted} exercises left to finish this
              course.
            </>
          ) : (
            statusMessage
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-game font-normal text-xs sm:text-sm font-bold">
              Exercises Completed
            </span>
            <span className="font-game font-normal text-xs sm:text-sm font-bold">
              {safeCompleted} / {totalExercises}
            </span>
          </div>
          <div className="w-full bg-gray-400 dark:bg-gray-600 rounded-none h-5 sm:h-6 border-4 border-gray-800 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] overflow-hidden">
            <div
              className="bg-green-500 h-full border-r-4 border-gray-800 transition-all duration-500 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <span className="text-gray-600 dark:text-gray-400 font-comfortaa">
              {isLoading
                ? "Loading progress..."
                : safeCompleted === 0
                ? "Just getting started!"
                : `${safeCompleted} down, keep pushing!`}
            </span>
            <span className="text-gray-600 dark:text-gray-400 font-mono">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="px-2 sm:px-3 py-1 bg-yellow-400 text-yellow-800 border-2 border-yellow-600 rounded-none text-[10px] sm:text-xs font-bold font-game font-normal shadow-[2px_2px_0_0_#d97706] whitespace-nowrap">
            {courseDetail?.level?.toUpperCase() || "LEVEL"}
          </div>
          <div className="px-2 sm:px-3 py-1 bg-blue-400 text-blue-800 border-2 border-blue-600 rounded-none text-[10px] sm:text-xs font-bold font-game font-normal shadow-[2px_2px_0_0_#1d4ed8] whitespace-nowrap">
            {totalChapters} CHAPTERS
          </div>
          <div className="px-2 sm:px-3 py-1 bg-green-400 text-green-900 border-2 border-green-600 rounded-none text-[10px] sm:text-xs font-bold font-game font-normal shadow-[2px_2px_0_0_#15803d] whitespace-nowrap">
            {safeCompleted} EXERCISES
          </div>
          {enrolledDate && (
            <div className="px-2 sm:px-3 py-1 bg-white text-gray-900 border-2 border-gray-800 rounded-none text-[10px] sm:text-xs font-bold font-game font-normal shadow-[2px_2px_0_0_#111] whitespace-nowrap">
              Enrolled {enrolledDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseStatus;
