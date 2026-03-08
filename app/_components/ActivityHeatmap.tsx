"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CourseStyleLoader } from "@/components/ui/course-style-loader";

interface ActivityData {
  date: string;
  count: number;
}

interface ActivityResponse {
  activities: ActivityData[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
  };
}

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function getStartOfWeek(date: Date) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const ActivityHeatmap = () => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response =
          await axios.get<ActivityResponse>("/api/user/activity");
        setActivities(response.data.activities || []);
        setStreak(
          response.data.streak || {
            currentStreak: 0,
            longestStreak: 0,
            totalActiveDays: 0,
          },
        );
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const { weeks, monthLabels, maxCount } = useMemo(() => {
    const countMap = new Map(activities.map((item) => [item.date, item.count]));

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 180);

    const gridStart = getStartOfWeek(startDate);
    const gridEnd = new Date(endDate);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

    const days: { date: string; count: number; month: string }[] = [];
    const cursor = new Date(gridStart);

    while (cursor <= gridEnd) {
      const key = formatDateKey(cursor);
      days.push({
        date: key,
        count: countMap.get(key) || 0,
        month: cursor.toLocaleString("default", { month: "short" }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weekColumns: { date: string; count: number; month: string }[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekColumns.push(days.slice(i, i + 7));
    }

    const labels: { index: number; label: string }[] = [];
    let lastMonth = "";
    weekColumns.forEach((week, index) => {
      const month = week[0]?.month;
      if (month && month !== lastMonth) {
        labels.push({ index, label: month });
        lastMonth = month;
      }
    });

    const highest = Math.max(...days.map((d) => d.count), 0);

    return {
      weeks: weekColumns,
      monthLabels: labels,
      maxCount: highest,
    };
  }, [activities]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-zinc-200 dark:bg-zinc-800";

    // LeetCode-like 4 intensity buckets based on personal max activity.
    const level = maxCount === 0 ? 1 : count / maxCount;
    if (level <= 0.25) return "bg-emerald-200 dark:bg-emerald-900";
    if (level <= 0.5) return "bg-emerald-400 dark:bg-emerald-700";
    if (level <= 0.75) return "bg-emerald-500 dark:bg-emerald-600";
    return "bg-emerald-700 dark:bg-emerald-400";
  };

  if (loading) {
    return <CourseStyleLoader className="py-8" spinnerClassName="h-10 w-10" />;
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-game text-base sm:text-lg">
          Streak Heatmap (Last 6 Months)
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-comfortaa">
          <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900 border-2 border-black/70 dark:border-white/60">
            Current streak: {streak.currentStreak}
          </span>
          <span className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900 border-2 border-black/70 dark:border-white/60">
            Best streak: {streak.longestStreak}
          </span>
          <span className="px-2 py-1 rounded-md bg-violet-100 dark:bg-violet-900 border-2 border-black/70 dark:border-white/60">
            Active days: {streak.totalActiveDays}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-black/70 dark:border-white/60 p-3 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="min-w-190">
          <div className="relative h-5 mb-1">
            {monthLabels.map((month) => (
              <span
                key={`${month.index}-${month.label}`}
                className="absolute text-[10px] text-muted-foreground"
                style={{ left: `${month.index * 14}px` }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1 items-start">
            <div className="flex flex-col gap-1 mr-1 mt-1 text-[10px] text-muted-foreground">
              <span>Sun</span>
              <span className="mt-4.5">Tue</span>
              <span className="mt-4.5">Thu</span>
              <span className="mt-4.5">Sat</span>
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-[2px] border border-black/10 dark:border-white/20 ${getColorClass(day.count)} transition-transform hover:scale-125`}
                      title={`${day.date}: ${day.count} solved/submitted activities`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground font-comfortaa">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-[2px] border border-black/10 dark:border-white/20 ${getColorClass(
                  maxCount === 0 ? level : Math.ceil((maxCount * level) / 4),
                )}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
