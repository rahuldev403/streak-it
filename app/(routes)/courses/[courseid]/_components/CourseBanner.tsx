"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
  bannerImage: string;
  level: string;
  tags: string;
  isEnrolled?: boolean;
}

type Props = {
  loading?: boolean;
  courseDetail: Course | undefined;
  refreshData?: () => Promise<void> | void;
};

const CourseBanner = ({ loading, courseDetail, refreshData }: Props) => {
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const { isSignedIn } = useUser();
  const router = useRouter();
  const courseId = courseDetail?.courseId;
  const canEnroll = useMemo(
    () => Boolean(courseId && !loadingEnroll),
    [courseId, loadingEnroll]
  );

  const handleContinueScroll = () => {
    if (typeof window === "undefined") return;
    const target = document.getElementById("course-chapters");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const EnrollCourse = async () => {
    if (!courseId) {
      toast.error("Course ID missing. Please reload the page.");
      return;
    }

    if (!isSignedIn) {
      toast("Please sign in to enroll.", {
        description: "You need an account to track your progress.",
      });
      router.push(
        "/sign-in?redirect_url=" + encodeURIComponent(window.location.href)
      );
      return;
    }

    try {
      setLoadingEnroll(true);
      await axios.post(`/api/enroll/enroll-course`, {
        courseId,
      });
      await Promise.resolve(refreshData?.());
      toast.success("Enrolled in course successfully!");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : "Failed to enroll in course. Please try again.";
      toast.error(message);
    } finally {
      setLoadingEnroll(false);
    }
  };

  return (
    <div className="flex justify-center items-center my-2 px-2 sm:px-4">
      {loading ? (
        <div className="w-full max-w-7xl h-40 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-gray-900 dark:border-white mx-auto mb-4"></div>
            <p className="font-game font-normal text-sm sm:text-base md:text-xl">
              Loading course banner...
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl h-40 sm:h-48 md:h-56 lg:h-64 relative rounded-md overflow-hidden shadow-lg border-4 border-gray-800">
          <Image
            src={courseDetail?.bannerImage || "/default-banner.jpg"}
            alt={courseDetail?.title || "Course Banner"}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-3 sm:p-4 md:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 font-game font-normal drop-shadow-lg">
              {courseDetail?.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white mb-2 sm:mb-3 md:mb-4 font-comfortaa max-w-2xl line-clamp-2 sm:line-clamp-3 drop-shadow-lg text-start">
              {courseDetail?.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-4">
              {!courseDetail?.isEnrolled ? (
                <Button
                  className="font-game font-normal rounded-md text-xs sm:text-sm md:text-base lg:text-lg px-3 sm:px-4 md:px-6 w-full sm:w-auto"
                  onClick={EnrollCourse}
                  disabled={!canEnroll}
                  variant={"pixel"}
                >
                  {loadingEnroll ? (
                    <>
                      <Loader2Icon className="animate-spin mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll Now"
                  )}
                </Button>
              ) : (
                <Button
                  variant={"pixel"}
                  className="font-game font-normal rounded-md px-3 sm:px-4 md:px-6 w-full sm:w-auto"
                  onClick={handleContinueScroll}
                >
                  <span className="font-game font-normal text-xs sm:text-sm md:text-base lg:text-lg">
                    continue to course &rarr;
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBanner;
