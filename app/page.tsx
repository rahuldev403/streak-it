"use client";

import { useEffect, useState } from "react";
import Hero from "./_components/Hero";
import CourseList from "./_components/CourseList";
import { MonitorIcon } from "lucide-react";

const page = () => {
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    const checkDeviceSize = () => {
      setIsSmallDevice(window.innerWidth < 1024);
    };

    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);

    return () => window.removeEventListener("resize", checkDeviceSize);
  }, []);

  return (
    <>
      <Hero />
    </>
  );
};

export default page;
