"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Enrolledcourses from "@/app/_components/Enrolledcourses";
import axios from "axios";

interface DashboardData {
  enrolledCourses: any[];
}

const EnrolledCoursesPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/dashboard");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-[calc(100vh-73px)] w-full p-3 sm:p-4 md:p-6 lg:p-8"
    >
      <div className="w-full">
        <Enrolledcourses
          enrolledCourses={dashboardData?.enrolledCourses || []}
          loading={loading}
          scrollable={false}
        />
      </div>
    </motion.div>
  );
};

export default EnrolledCoursesPage;
