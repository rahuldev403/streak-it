"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import boy from "@/public/boy.gif";
import { useUser } from "@clerk/nextjs";
import ActivityHeatmap from "@/app/_components/ActivityHeatmap";
import { CourseStyleLoader } from "@/components/ui/course-style-loader";

interface Stats {
  coursesEnrolled: number;
  projectsCompleted: number;
  certificatesEarned: number;
  hoursLearned: number;
}

interface UserStatusProps {
  stats?: Stats;
  loading?: boolean;
  lastSessionPerformance?: {
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

const UserStatus = ({
  stats,
  loading,
  lastSessionPerformance,
}: UserStatusProps) => {
  const { user } = useUser();

  const displayStats = [
    {
      label: "Courses Enrolled",
      value: stats?.coursesEnrolled || 0,
      accent: "bg-sky-100 dark:bg-sky-950 border-sky-500",
      valueColor: "text-sky-700 dark:text-sky-300",
    },
    {
      label: "Projects Completed",
      value: stats?.projectsCompleted || 0,
      accent: "bg-emerald-100 dark:bg-emerald-950 border-emerald-500",
      valueColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Certificates Earned",
      value: stats?.certificatesEarned || 0,
      accent: "bg-violet-100 dark:bg-violet-950 border-violet-500",
      valueColor: "text-violet-700 dark:text-violet-300",
    },
    {
      label: "Hours Learned",
      value: stats?.hoursLearned || 0,
      accent: "bg-amber-100 dark:bg-amber-950 border-amber-500",
      valueColor: "text-amber-700 dark:text-amber-300",
    },
  ];

  const solved = lastSessionPerformance?.solved || 0;
  const attempted = lastSessionPerformance?.attempted || 0;
  const dsaSolved = lastSessionPerformance?.breakdown.dsaSolved || 0;
  const csSolved = lastSessionPerformance?.breakdown.csSolved || 0;
  const solvedMixTotal = Math.max(dsaSolved + csSolved, 1);
  const dsaMixPercent = Math.round((dsaSolved / solvedMixTotal) * 100);
  const csMixPercent = Math.round((csSolved / solvedMixTotal) * 100);

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex gap-4 items-center border-4 border-black dark:border-white bg-white/90 dark:bg-gray-900/90 p-3 sm:p-4 rounded-xl shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="shrink-0"
        >
          <Image
            src={boy}
            alt="Boy Animation"
            width={48}
            height={48}
            className="rounded-full border-2 border-black dark:border-white"
          />
        </motion.div>
        <div className="min-w-0">
          <p className="font-comfortaa text-xs text-muted-foreground">
            Welcome back
          </p>
          <h2 className="font-game font-normal text-primary break-all text-sm sm:text-base">
            {user?.primaryEmailAddress?.emailAddress || "Learner"}
          </h2>
        </div>
      </motion.div>

      <div className="flex items-center justify-around gap-4 ">
        <div className="rounded-xl border-4 border-black dark:border-white p-4 bg-white dark:bg-gray-900 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
          <h3 className="font-game font-normal text-base sm:text-lg mb-3">
            Core Learning Stats
          </h3>
          {loading ? (
            <CourseStyleLoader className="py-10" spinnerClassName="h-12 w-12" />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2,
                  },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
            >
              {displayStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={`p-3 sm:p-4 rounded-xl border-4 border-black dark:border-white ${stat.accent} shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]`}
                  style={{ imageRendering: "pixelated" }}
                >
                  <h3
                    className={`text-2xl sm:text-3xl font-game font-normal ${stat.valueColor}`}
                  >
                    {stat.value}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-game font-normal text-xs sm:text-sm">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="h-full"
        >
          <div className="h-full rounded-xl border-4 border-black dark:border-white p-4 bg-white dark:bg-gray-900 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
            <h3 className="font-game font-normal text-base sm:text-lg mb-2">
              Last Session Performance
            </h3>
            {loading ? (
              <CourseStyleLoader
                className="py-10"
                spinnerClassName="h-12 w-12"
              />
            ) : lastSessionPerformance ? (
              <>
                <p className="text-xs text-muted-foreground mb-3 font-comfortaa">
                  {new Date(
                    lastSessionPerformance.latestSubmissionAt,
                  ).toLocaleString()}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-lg border-2 border-black dark:border-white p-2 bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-muted-foreground">Attempted</p>
                    <p className="font-game text-xl">
                      {lastSessionPerformance.attempted}
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-black dark:border-white p-2 bg-emerald-50 dark:bg-emerald-900/40">
                    <p className="text-xs text-muted-foreground">Solved</p>
                    <p className="font-game text-xl text-green-600">
                      {lastSessionPerformance.solved}
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-black dark:border-white p-2 bg-violet-50 dark:bg-violet-900/40">
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                    <p className="font-game text-xl">
                      {lastSessionPerformance.accuracy}%
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-black dark:border-white p-2 bg-amber-50 dark:bg-amber-900/40">
                    <p className="text-xs text-muted-foreground">
                      DSA/CS Solved
                    </p>
                    <p className="font-game text-xl">
                      {lastSessionPerformance.breakdown.dsaSolved}/
                      {lastSessionPerformance.breakdown.csSolved}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-comfortaa mb-1">
                      <span className="text-muted-foreground">
                        Solved Progress
                      </span>
                      <span>
                        {solved}/{attempted}
                      </span>
                    </div>
                    <div className="h-3 w-full border-2 border-black dark:border-white rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${lastSessionPerformance.accuracy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-comfortaa mb-1">
                      <span className="text-muted-foreground">Solved Mix</span>
                      <span>
                        DSA {dsaMixPercent}% / CS {csMixPercent}%
                      </span>
                    </div>
                    <div className="h-3 w-full border-2 border-black dark:border-white rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex">
                      <div
                        className="h-full bg-sky-500"
                        style={{ width: `${dsaMixPercent}%` }}
                      />
                      <div
                        className="h-full bg-fuchsia-500"
                        style={{ width: `${csMixPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground font-comfortaa">
                No session data yet. Solve a few questions and this card will
                update.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
      >
        <div className="rounded-xl border-4 border-black dark:border-white p-4 bg-white dark:bg-gray-900 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
          <ActivityHeatmap />
        </div>
      </motion.div>
    </div>
  );
};

export default UserStatus;
