"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
type Course = {
  id: number;
  courseId: string;
  title: string;
  description: string;
  bannerImage: string;
  level: string;
  tags: string[];
};

const CourseList = () => {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/course");
        const list = Array.isArray(res.data) ? res.data : [];
        setCourseList(list);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center mt-5 p-4 border-2 h-auto pointer-events-auto">
      <h2 className="font-game text-black font-bold text-3xl">All Courses</h2>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 dark:border-white mb-4"></div>
          <p className="font-game text-xl">Loading courses...</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 
        "
        >
          {courseList.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground font-mono">
              No courses available yet.
            </div>
          ) : (
            courseList.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.courseId}`}
                className="border-4 border-gray-800 rounded-md w-[90%] mx-auto box-shadow-lg bg-gray-200 relative hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer"
              >
                <div>
                  <div className="p-2 ">
                    <Image
                      src={course.bannerImage}
                      alt={course.title}
                      width={200}
                      height={100}
                      className="rounded-md object-cover w-full h-25 object-center"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="font-game">{course.title}</h3>
                    <p>{course.description}</p>
                  </div>
                  <div className="p-2 flex justify-between items-center">
                    <span className="absolute bottom-0 right-0 px-3 py-1 text-xs font-bold bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-game rounded-br-md rounded-tl-md">
                      {course.level}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CourseList;
