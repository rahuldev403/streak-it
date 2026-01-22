"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import {
  dsaApi,
  getSkillLevelProgress,
  getNextMilestone,
} from "@/lib/dsa-client";
import type { UserDsaProgress } from "@/types/dsa";

interface DSAProgressDashboardProps {
  userId: string;
}

/**
 * Example dashboard component showing user's DSA progress
 * Displays stats, skill level, and category strengths/weaknesses
 */
export default function DSAProgressDashboard({
  userId,
}: DSAProgressDashboardProps) {
  const [progress, setProgress] = useState<UserDsaProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const response = await dsaApi.getUserProgress(userId);
      setProgress(response.progress);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Failed to load progress data
      </div>
    );
  }

  const skillLevelColors = {
    beginner: "bg-blue-100 text-blue-800",
    intermediate: "bg-green-100 text-green-800",
    advanced: "bg-purple-100 text-purple-800",
    expert: "bg-yellow-100 text-yellow-800",
  };

  const progressPercentage = getSkillLevelProgress(
    progress.skillLevel,
    progress.totalQuestionsSolved,
  );
  const nextMilestone = getNextMilestone(
    progress.skillLevel,
    progress.totalQuestionsSolved,
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your DSA Progress</h1>

      {/* Skill Level Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Current Skill Level</CardTitle>
            <Badge className={skillLevelColors[progress.skillLevel]}>
              {progress.skillLevel.toUpperCase()}
            </Badge>
          </div>
          <CardDescription>
            Keep solving to reach the next level!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next level</span>
              <span className="font-semibold">
                {progress.totalQuestionsSolved} / {nextMilestone} questions
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-xs text-muted-foreground text-right">
              {nextMilestone - progress.totalQuestionsSolved} more to go!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {progress.totalQuestionsSolved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All difficulty levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Easy Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {progress.easyQuestionsSolved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress.totalQuestionsSolved > 0
                ? Math.round(
                    (progress.easyQuestionsSolved /
                      progress.totalQuestionsSolved) *
                      100,
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Medium Problems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {progress.mediumQuestionsSolved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress.totalQuestionsSolved > 0
                ? Math.round(
                    (progress.mediumQuestionsSolved /
                      progress.totalQuestionsSolved) *
                      100,
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hard Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {progress.hardQuestionsSolved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress.totalQuestionsSolved > 0
                ? Math.round(
                    (progress.hardQuestionsSolved /
                      progress.totalQuestionsSolved) *
                      100,
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💪 Your Strengths</CardTitle>
            <CardDescription>Categories you excel at</CardDescription>
          </CardHeader>
          <CardContent>
            {progress.preferredCategories &&
            progress.preferredCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {progress.preferredCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Keep solving problems to identify your strengths!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weak Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Focus Areas</CardTitle>
            <CardDescription>Categories to improve on</CardDescription>
          </CardHeader>
          <CardContent>
            {progress.weakCategories && progress.weakCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {progress.weakCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                The system will identify areas for improvement as you practice.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity */}
      {progress.lastActivityDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Last practiced:{" "}
              <span className="font-semibold">
                {new Date(progress.lastActivityDate).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="text-center">
            {progress.totalQuestionsSolved === 0 ? (
              <>
                <p className="text-lg font-semibold mb-2">🚀 Ready to start?</p>
                <p className="text-sm text-muted-foreground">
                  Generate your first personalized DSA question and begin your
                  coding journey!
                </p>
              </>
            ) : progress.totalQuestionsSolved < 10 ? (
              <>
                <p className="text-lg font-semibold mb-2">🌱 Great start!</p>
                <p className="text-sm text-muted-foreground">
                  You're building momentum. Keep practicing to level up to
                  intermediate!
                </p>
              </>
            ) : progress.totalQuestionsSolved < 50 ? (
              <>
                <p className="text-lg font-semibold mb-2">
                  📈 Making progress!
                </p>
                <p className="text-sm text-muted-foreground">
                  You're on your way to mastery. Try tackling some medium
                  difficulty problems!
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold mb-2">
                  ⭐ Impressive work!
                </p>
                <p className="text-sm text-muted-foreground">
                  You're well on your way to becoming an expert. Challenge
                  yourself with hard problems!
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
