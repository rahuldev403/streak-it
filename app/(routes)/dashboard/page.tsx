"use client";
import { useEffect, useState } from "react";
import Enrolledcourses from "@/app/_components/Enrolledcourses";
import ExploreMore from "@/app/_components/ExploreMore";
import InviteFriend from "@/app/_components/InviteFriend";
import UpgradeToPro from "@/app/_components/UpgradeToPro";
import UserStatus from "@/app/_components/UserStatus";
import Welcomebanner from "@/app/_components/Welcomebanner";
import axios from "axios";

interface DashboardData {
  enrolledCourses: any[];
  stats: {
    coursesEnrolled: number;
    projectsCompleted: number;
    certificatesEarned: number;
    hoursLearned: number;
  };
}

const Page = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Welcomebanner />
            <Enrolledcourses
              enrolledCourses={dashboardData?.enrolledCourses || []}
              loading={loading}
            />
            <ExploreMore />
          </div>
          <div className="flex flex-col gap-4 sm:gap-6 border-2 items-center border-gray-600 p-3 sm:p-4 rounded-lg">
            <UserStatus stats={dashboardData?.stats} loading={loading} />
            <UpgradeToPro />
          </div>
        </div>

        <InviteFriend />
      </div>
    </div>
  );
};

export default Page;
