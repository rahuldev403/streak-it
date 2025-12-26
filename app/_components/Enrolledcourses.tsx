"use client";
import Image from "next/image";
import empty from "@/public/Questions-amico.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface EnrolledCourse {
  id: number;
  courseId: string;
  title: string;
  description: string;
  bannerImage: string;
  level: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
}

interface EnrolledcoursesProps {
  enrolledCourses: EnrolledCourse[];
  loading?: boolean;
}

const Enrolledcourses = ({
  enrolledCourses,
  loading,
}: EnrolledcoursesProps) => {
  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-game font-normal">
          Enrolled Courses
        </h2>
        <div className="flex flex-col items-center justify-center p-12 bg-muted/50 border-4 border-dotted border-muted rounded-lg mt-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 dark:border-white mb-4"></div>
          <p className="font-game font-normal text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 lg:mt-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-game font-normal">
        Enrolled Courses
      </h2>
      <div className="max-h-[400px] overflow-y-auto">
        {enrolledCourses.length === 0 ? (
          <div className="flex flex-col items-center p-4 sm:p-7 bg-muted/50 border-4 border-dotted border-muted rounded-lg mt-2">
            <Image
              src={empty}
              alt="No courses enrolled"
              width={90}
              height={90}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
            />
            <h2 className="text-bold font-comfortaa text-base sm:text-xl md:text-2xl lg:text-3xl text-center mt-2">
              No courses enrolled
            </h2>
            <Link href="/courses">
              <Button
                variant={"pixel"}
                className="mt-4 rounded-md text-black font-game font-normal text-xs sm:text-sm md:text-base"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {enrolledCourses.map((course) => {
              const progressPercent =
                course.totalChapters > 0
                  ? Math.round(
                      (course.completedChapters / course.totalChapters) * 100
                    )
                  : 0;

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.courseId}`}
                  className="block"
                >
                  <div className="border-4 border-gray-800 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer">
                    <div className="flex gap-4 items-start">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-md overflow-hidden border-2 border-gray-800">
                        <Image
                          src={course.bannerImage}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-game font-normal text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                          {course.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-game font-normal text-gray-700 dark:text-gray-300">
                              Progress: {course.completedChapters} /{" "}
                              {course.totalChapters} chapters
                            </span>
                            <span className="font-game font-normal text-blue-600 dark:text-blue-400 font-bold">
                              {progressPercent}%
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Enrolledcourses;
