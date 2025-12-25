"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import CourseBanner from "./_components/CourseBanner";
import CourseChapter from "./_components/CourseChapter";
import CourseStatus from "./_components/CourseStatus";
import UpgradeToPro from "@/app/_components/UpgradeToPro";
import { CommunityHelp } from "./_components/CommunityHelp";

type Chapter = {
  id: number;
  courseId: string;
  name: string;
  desc: string;
  exercise: string | null;
};

interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
  bannerImage: string;
  level: string;
  tags: string;
  Chapters?: Chapter[];
}

const CourseDetail = () => {
  const { courseid } = useParams<{ courseid: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [chaptersError, setChaptersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
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
    };

    fetchCourse();
  }, [courseid]);

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

  if (loading) {
    return <LoadingScreen message="Loading course..." size="lg" />;
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

  return (
    <div>
      <CourseBanner loading={loading} courseDetail={course} />
      <div className="grid grid-cols-4 p-5 gap-4">
        <div className="col-span-2">
          <CourseChapter
            loading={loading}
            chapters={chapters}
            chaptersLoading={chaptersLoading}
            chaptersError={chaptersError}
            onRetryChapters={fetchChapters}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-6 justify-between ">
          <CourseStatus
            loading={loading}
            courseDetail={course}
            chapters={chapters}
            chaptersLoading={chaptersLoading}
          />
          <UpgradeToPro />
          <CommunityHelp courseId={course.courseId} />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
