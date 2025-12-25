"use client";

interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
  bannerImage: string;
  level: string;
  tags: string;
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
};

const CourseStatus = ({
  loading,
  chaptersLoading,
  courseDetail,
  chapters,
}: Props) => {
  const completedChapters = 0; // TODO: derive from user progress once available
  const totalChapters = chapters.length;
  const progressPercent = totalChapters
    ? Math.round((completedChapters / totalChapters) * 100)
    : 0;

  const isLoading = loading || chaptersLoading;

  return (
    <div>
      <div className=" p-6 bg-gray-200 dark:bg-gray-800 border-4 border-gray-800 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] min-h-80 rounded-md">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎯</span>
          <h3 className="font-bold font-game text-2xl text-black dark:text-white">
            Course Progress
          </h3>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6 font-mono">
          {isLoading
            ? "Syncing your chapters..."
            : "Complete all chapters to unlock your achievement badge and certificate!"}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-game text-sm font-bold">Progress</span>
            <span className="font-game text-sm font-bold">
              {completedChapters} / {totalChapters}
            </span>
          </div>
          <div className="w-full bg-gray-400 dark:bg-gray-600 rounded-none h-6 border-4 border-gray-800 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] overflow-hidden">
            <div
              className="bg-green-500 h-full border-r-4 border-gray-800 transition-all duration-500 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-linear-to-r from-green-400 to-green-600" />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400 font-mono">
              {isLoading ? "Loading progress..." : "Just getting started!"}
            </span>
            <span className="text-gray-600 dark:text-gray-400 font-mono">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <div className="px-3 py-1 bg-yellow-400 text-yellow-800 border-2 border-yellow-600 rounded-none text-xs font-bold font-game shadow-[2px_2px_0_0_#d97706]">
            {courseDetail?.level?.toUpperCase() || "LEVEL"}
          </div>
          <div className="px-3 py-1 bg-blue-400 text-blue-800 border-2 border-blue-600 rounded-none text-xs font-bold font-game shadow-[2px_2px_0_0_#1d4ed8]">
            {totalChapters} CHAPTERS
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStatus;
