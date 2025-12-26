"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import CourseBanner from "./_components/CourseBanner";
import CourseChapter from "./_components/CourseChapter";
import CourseStatus from "./_components/CourseStatus";
import UpgradeToPro from "@/app/_components/UpgradeToPro";
import { CommunityHelp } from "./_components/CommunityHelp";
import { useUser } from "@clerk/nextjs";
import { MonitorIcon, AlertTriangle, ArrowLeft } from "lucide-react";

type Chapter = {
  id: number;
  courseId: string;
  name: string;
  desc: string;
  exercise: string | null;
};

interface EnrolledCourse {
  id: number;
  courseId: string;
  userId: string;
  enrolledDate: string;
  progress: number;
}

export interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
  bannerImage: string;
  level: string;
  tags: string;
  Chapters?: Chapter[];
  isEnrolled?: boolean;
  enrolledCourse?: EnrolledCourse | null;
  completedChapters?: UserProgress[];
}
interface UserProgress {
  id: number;
  userId: string;
  courseId: string;
  chapterId: string;
  updatedAt: string;
}

const CourseDetail = () => {
  const { courseid } = useParams<{ courseid: string }>();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [chaptersError, setChaptersError] = useState<string | null>(null);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  // Check if device is small (mobile/tablet)
  useEffect(() => {
    const checkDeviceSize = () => {
      setIsSmallDevice(window.innerWidth < 1024); // Block devices smaller than 1024px
    };

    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);

    return () => window.removeEventListener("resize", checkDeviceSize);
  }, []);

  // Check subscription status from Clerk
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await axios.get("/api/user/subscription");
        setHasPremiumAccess(response.data.hasPremium);
      } catch (error) {
        console.error("Failed to check subscription:", error);
        setHasPremiumAccess(false);
      }
    };

    checkSubscription();
  }, [user, isLoaded]);

  const fetchCourse = useCallback(async () => {
    if (!courseid) return;

    try {
      setLoading(true);
      setError(null);
      const result = await axios.get(`/api/course?courseId=${courseid}`);
      setCourse(result.data);
    } catch (error) {
      console.error("Failed to fetch course:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError("Course not found");
      } else {
        setError("Failed to load course. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [courseid]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const fetchChapters = useCallback(async () => {
    if (!courseid) {
      setChapters([]);
      setChaptersLoading(false);
      return;
    }

    try {
      setChaptersLoading(true);
      setChaptersError(null);
      const response = await axios.get(`/api/chapters?courseId=${courseid}`);
      setChapters(response.data || []);
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      setChaptersError("Failed to load chapters. Please try again.");
    } finally {
      setChaptersLoading(false);
    }
  }, [courseid]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleChapterComplete = useCallback(
    async (chapterIndex: number) => {
      if (!course?.isEnrolled) {
        toast.error("Enroll in the course to track progress.");
        return;
      }

      const courseIdentifier = course.courseId ?? courseid;
      if (!courseIdentifier) return;

      const currentProgress = course.enrolledCourse?.progress ?? 0;
      const targetProgress = Math.min(
        chapters.length,
        Math.max(currentProgress, chapterIndex + 1)
      );

      if (targetProgress === currentProgress) {
        toast("Already completed", {
          description: "This chapter is already marked complete.",
        });
        return;
      }

      try {
        await axios.post("/api/enroll/progress", {
          courseId: courseIdentifier,
          progress: targetProgress,
        });
        await fetchCourse();
        toast.success("Progress updated!");
      } catch (error) {
        console.error("Failed to update progress:", error);
        toast.error("Failed to update progress. Please try again.");
      }
    },
    [course, courseid, chapters.length, fetchCourse]
  );

  // Block access on small devices
  if (isSmallDevice) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-73px)] w-full flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md text-center border-4 border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <MonitorIcon className="w-20 h-20 mx-auto mb-6 text-blue-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-game font-normal text-2xl mb-4 text-gray-900 dark:text-white flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-6 h-6" />
            Desktop Required
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
          >
            Course content and exercises are best viewed on a larger screen for
            an optimal learning experience.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-600 dark:text-gray-400 mb-6"
          >
            Please access this page from a desktop or laptop computer (minimum
            1024px width).
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/courses")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black font-game font-normal shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-73px)] w-full flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-game font-normal text-xl"
          >
            Loading course...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-muted-foreground">
          The requested course could not be found.
        </p>
      </div>
    );
  }

  const isEnrolled = Boolean(course.isEnrolled);
  const completedExercises = course.enrolledCourse?.progress ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CourseBanner
        loading={loading}
        courseDetail={course}
        refreshData={fetchCourse}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 p-3 sm:p-5 gap-4 sm:gap-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <CourseChapter
            loading={loading}
            chapters={chapters}
            chaptersLoading={chaptersLoading}
            chaptersError={chaptersError}
            onRetryChapters={fetchChapters}
            isEnrolled={isEnrolled}
            completedExercises={completedExercises}
            onCompleteChapter={handleChapterComplete}
            courseId={course.courseId}
            hasPremiumAccess={hasPremiumAccess}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full flex flex-col gap-4 sm:gap-6"
        >
          <CourseStatus
            loading={loading}
            courseDetail={course}
            chapters={chapters}
            chaptersLoading={chaptersLoading}
            isEnrolled={isEnrolled}
            completedExercises={completedExercises}
          />
          <UpgradeToPro />
          <CommunityHelp courseId={course.courseId} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;
