"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import boy from "@/public/boy.gif";
import { useUser } from "@clerk/nextjs";
import ActivityHeatmap from "./ActivityHeatmap";

interface Stats {
  coursesEnrolled: number;
  projectsCompleted: number;
  certificatesEarned: number;
  hoursLearned: number;
}

interface UserStatusProps {
  stats?: Stats;
  loading?: boolean;
}

const UserStatus = ({ stats, loading }: UserStatusProps) => {
  const { user } = useUser();

  const displayStats = [
    { label: "Courses Enrolled", value: stats?.coursesEnrolled || 0 },
    { label: "Projects Completed", value: stats?.projectsCompleted || 0 },
    { label: "Certificates Earned", value: stats?.certificatesEarned || 0 },
    { label: "Hours Learned", value: stats?.hoursLearned || 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex gap-4 items-center"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image
            src={boy}
            alt="Boy Animation"
            width={40}
            height={40}
            className="rounded-full"
          />
        </motion.div>
        <h2 className="font-game font-normal text-bold text-primary w-[80%] break-words overflow-hidden text-sm sm:text-base">
          {user?.primaryEmailAddress?.emailAddress}!
        </h2>
      </motion.div>
      <div className="flex flex-col justify-center items-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-game font-normal text-xl sm:text-2xl font-bold text-center"
        >
          Your Learning Stats
        </motion.h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 dark:border-white"></div>
          </div>
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
            className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 w-full"
          >
            {displayStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border-4 border-gray-800"
                style={{ imageRendering: "pixelated" }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold font-game font-normal text-black dark:text-white">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-game font-normal text-xs sm:text-sm">
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
      >
        <ActivityHeatmap />
      </motion.div>
    </div>
  );
};

export default UserStatus;
