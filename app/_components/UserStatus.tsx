import Image from "next/image";
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
      <div className="flex gap-4 items-center">
        <Image
          src={boy}
          alt="Boy Animation"
          width={40}
          height={40}
          className="rounded-full"
        />
        <h2 className="font-game text-bold text-primary w-[80%] break-words overflow-hidden text-sm sm:text-base">
          {user?.primaryEmailAddress?.emailAddress}!
        </h2>
      </div>
      <div className="flex flex-col justify-center items-center">
        <h2 className="font-game text-xl sm:text-2xl font-bold text-center">
          Your Learning Stats
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 w-full">
            {displayStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border-4 border-gray-800"
                style={{ imageRendering: "pixelated" }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold font-game text-black dark:text-white">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-game text-xs sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <ActivityHeatmap />
    </div>
  );
};

export default UserStatus;
