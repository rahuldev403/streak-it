"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface ActivityData {
  date: string;
  count: number;
}

const ActivityHeatmap = () => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/user/activity");
        setActivities(response.data);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  // Generate last 90 days
  const generateLast90Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const getActivityCount = (date: string) => {
    const activity = activities.find((a) => a.date === date);
    return activity?.count || 0;
  };

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-gray-200 dark:bg-gray-700";
    if (count <= 2) return "bg-green-300 dark:bg-green-800";
    if (count <= 4) return "bg-green-400 dark:bg-green-600";
    if (count <= 6) return "bg-green-500 dark:bg-green-500";
    return "bg-green-600 dark:bg-green-400";
  };

  const days = generateLast90Days();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 w-full">
      <h3 className="font-game text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 text-center">
        Your Activity
      </h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-0.5 sm:gap-1 justify-center min-w-fit px-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
              {week.map((date) => {
                const count = getActivityCount(date);
                return (
                  <div
                    key={date}
                    className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 border border-black dark:border-white ${getColorClass(
                      count
                    )} transition-all hover:scale-125 cursor-pointer`}
                    style={{ imageRendering: "pixelated" }}
                    title={`${date}: ${count} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center gap-1 sm:gap-2 mt-3 sm:mt-4">
        <span className="font-game text-[10px] sm:text-xs">Less</span>
        <div className="flex gap-1">
          {[0, 1, 3, 5, 7].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 border-2 border-black ${getColorClass(
                level
              )}`}
              style={{ imageRendering: "pixelated" }}
            />
          ))}
        </div>
        <span className="font-game text-xs">More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
