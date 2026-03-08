"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Flame, Target } from "lucide-react";
import UserStatus from "@/app/_components/UserStatus";

interface DashboardData {
  stats: {
    coursesEnrolled: number;
    projectsCompleted: number;
    certificatesEarned: number;
    hoursLearned: number;
  };
  lastSessionPerformance: {
    date: string;
    latestSubmissionAt: string;
    attempted: number;
    solved: number;
    accuracy: number;
    breakdown: {
      dsaAttempted: number;
      dsaSolved: number;
      csAttempted: number;
      csSolved: number;
    };
  } | null;
}

export default function LearningStatsPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const solved = data?.lastSessionPerformance?.solved || 0;
  const attempted = data?.lastSessionPerformance?.attempted || 0;
  const accuracy = data?.lastSessionPerformance?.accuracy || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/dashboard");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch learning stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-linear-to-br from-cyan-50 via-amber-50 to-emerald-50 dark:from-slate-950 dark:via-zinc-950 dark:to-slate-900"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(#0f172a_1px,transparent_1px)] bg-size-[18px_18px] dark:bg-[radial-gradient(#f8fafc_1px,transparent_1px)]" />

      <div className="relative max-w-6xl mx-auto">
        <div className="rounded-2xl border-4 border-black dark:border-white bg-white/90 dark:bg-gray-950/90 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-game font-normal text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
                Learning Command Center
              </h1>
              <p className="font-comfortaa text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
                Track your momentum, review last session quality, and keep your
                daily streak alive.
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black dark:border-white font-game font-normal rounded shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff] transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <div className="rounded-xl border-2 border-black dark:border-white p-3 bg-amber-100 dark:bg-amber-950/60">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <p className="font-comfortaa text-xs text-slate-700 dark:text-slate-300">
                  Last Session Solved
                </p>
              </div>
              <p className="font-game text-2xl mt-1">
                {loading ? "--" : solved}
              </p>
            </div>

            <div className="rounded-xl border-2 border-black dark:border-white p-3 bg-sky-100 dark:bg-sky-950/60">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <p className="font-comfortaa text-xs text-slate-700 dark:text-slate-300">
                  Attempted
                </p>
              </div>
              <p className="font-game text-2xl mt-1">
                {loading ? "--" : attempted}
              </p>
            </div>

            <div className="rounded-xl border-2 border-black dark:border-white p-3 bg-violet-100 dark:bg-violet-950/60">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <p className="font-comfortaa text-xs text-slate-700 dark:text-slate-300">
                  Accuracy
                </p>
              </div>
              <p className="font-game text-2xl mt-1">
                {loading ? "--" : `${accuracy}%`}
              </p>
            </div>
          </div>
        </div>

        <div className="border-4 border-black dark:border-white p-3 sm:p-4 rounded-2xl bg-white/90 dark:bg-gray-950/90 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
          <UserStatus
            stats={data?.stats}
            loading={loading}
            lastSessionPerformance={data?.lastSessionPerformance}
          />
        </div>
      </div>
    </motion.div>
  );
}
