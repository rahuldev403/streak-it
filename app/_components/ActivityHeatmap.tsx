"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CourseStyleLoader } from "@/components/ui/course-style-loader";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const cellSize = 14;
  const cellGap = 6;

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

    const days: {
      date: string;
      count: number;
      month: string;
      dayOfMonth: number;
      yearMonth: string;
    }[] = [];
    const cursor = new Date(gridStart);

    while (cursor <= gridEnd) {
      const key = formatDateKey(cursor);
      const month = cursor.toLocaleString("default", { month: "short" });
      days.push({
        date: key,
        count: countMap.get(key) || 0,
        month,
        dayOfMonth: cursor.getDate(),
        yearMonth: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weekColumns: {
      date: string;
      count: number;
      month: string;
      dayOfMonth: number;
      yearMonth: string;
    }[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekColumns.push(days.slice(i, i + 7));
    }

    const labels: { index: number; label: string }[] = [];
    const seenMonth = new Set<string>();
    days.forEach((day, dayIndex) => {
      const shouldLabel = dayIndex === 0 || day.dayOfMonth === 1;
      if (shouldLabel && !seenMonth.has(day.yearMonth)) {
        labels.push({ index: Math.floor(dayIndex / 7), label: day.month });
        seenMonth.add(day.yearMonth);
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

      <div className="overflow-x-auto rounded-lg border-2 border-black/70 dark:border-white/60 p-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto w-max min-w-215">
          <div className="flex justify-center">
            <div className="flex" style={{ gap: `${cellGap}px` }}>
              {weeks.map((week, weekIdx) => (
                <div
                  key={weekIdx}
                  className="flex flex-col"
                  style={{ gap: `${cellGap}px` }}
                >
                  {week.map((day) => (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded-[3px] border border-black/10 dark:border-white/20 ${getColorClass(day.count)} transition-transform hover:scale-110 cursor-pointer`}
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="border-2 border-black dark:border-white bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] px-3 py-2">
                        <p className="font-game text-xs text-black dark:text-white">
                          {day.date}
                        </p>
                        <p className="font-comfortaa text-[11px] text-muted-foreground">
                          {day.count} submissions
                        </p>
                      </TooltipContent>
                    </Tooltip>
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
