"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import banner from "@/public/bg.gif";
import CourseList from "@/app/_components/CourseList";
import { MonitorIcon } from "lucide-react";

const page = () => {
  const router = useRouter();
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    const checkDeviceSize = () => {
      setIsSmallDevice(window.innerWidth < 1024);
    };

    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);

    return () => window.removeEventListener("resize", checkDeviceSize);
  }, []);

  if (isSmallDevice) {
    return (
      <div className="h-[calc(100vh-73px)] w-full flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md text-center border-4 border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
          <MonitorIcon className="w-20 h-20 mx-auto mb-6 text-purple-600" />
          <h2 className="font-game font-normal text-2xl mb-4 text-gray-900 dark:text-white">
            [!] Desktop Required
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Go to a bigger screen to enjoy the{" "}
            <span className="font-game font-normal text-purple-600 dark:text-purple-400">
              next gen - coding adventure
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please access this page from a desktop or laptop computer (minimum
            1024px width).
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white border-2 border-black font-game font-normal shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            [←] Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative flex justify-center rounded-md border-4 border-gray-800 overflow-hidden mt-3 w-[80%] mx-auto box-shadow-lg h-[300px] sm:h-[400px]">
        <Image
          src={banner}
          alt="banner"
          priority
          className="border-4 border-gray-800 w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black/40 pointer-events-none">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-game font-normal font-bold text-white drop-shadow-lg">
            Explore Our Courses
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-game font-normal text-white drop-shadow-lg mt-2 px-4 text-center">
            Dive into a variety of courses designed to enhance your skills and
            knowledge.
          </p>
        </div>
      </div>
      <div>
        <CourseList />
      </div>
    </div>
  );
};

export default page;
