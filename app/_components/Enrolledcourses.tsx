"use client";
import { useState } from "react";
import Image from "next/image";
import empty from "@/public/Questions-amico.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const Enrolledcourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  return (
    <div className="mt-8">
      <h2 className="text-4xl font-game">Enrolled Courses</h2>
      <div>
        {enrolledCourses.length === 0 ? (
          <div className="flex flex-col items-center p-7 bg-muted/50 border-4 border-dotted border-muted rounded-lg mt-2">
            <Image
              src={empty}
              alt="No courses enrolled"
              width={90}
              height={90}
            />
            <h2 className="text-bold font-comfortaa text-3xl">
              No courses enrolled
            </h2>
            <Link href="/courses">
              <Button
                variant={"pixel"}
                className="mt-4 rounded-md text-black font-game"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div>courses</div>
        )}
      </div>
    </div>
  );
};

export default Enrolledcourses;
