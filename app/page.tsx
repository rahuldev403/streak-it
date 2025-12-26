"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Hero from "./_components/Hero";
import Description from "./_components/Description";
import Footer from "./_components/Footer";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <Description />
      <Footer />
    </motion.div>
  );
};

export default page;
