"use client";
import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import axios from "axios";

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChapters = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/admin/save-chapters");

      if (response.data.success) {
        toast.success(response.data.message, {
          description: `${response.data.chapters.length} chapters added successfully!`,
          duration: 4000,
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error saving chapters:", error);
      toast.error("Failed to save chapters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-game text-primary mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage course content and system data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <div className="border-4 border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg">
            <h2 className="text-2xl font-bold font-game mb-4">
              Course Chapters
            </h2>
            <p className="text-muted-foreground mb-6">
              Load sample chapter data into the database. This will populate
              chapters for existing courses.
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What will be added:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 10+ sample chapters across different courses</li>
                  <li>
                    • Chapters for React, Next.js, TypeScript, and Full-stack
                    courses
                  </li>
                  <li>
                    • Each chapter includes descriptions and practical exercises
                  </li>
                </ul>
              </div>

              <LoadingButton
                onClick={handleSaveChapters}
                loading={isLoading}
                loadingText="Saving Chapters..."
                className="w-full md:w-auto font-game text-black"
                size="lg"
              >
                Save Sample Chapters
              </LoadingButton>
            </div>
          </div>

          <div className="border-4 border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg opacity-60">
            <h2 className="text-2xl font-bold font-game mb-4">
              User Management
            </h2>
            <p className="text-muted-foreground mb-6">
              Manage user roles, subscriptions, and permissions.
            </p>
            <LoadingButton
              disabled
              className="w-full md:w-auto font-game text-black"
              size="lg"
            >
              Coming Soon
            </LoadingButton>
          </div>

          <div className="border-4 border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg opacity-60">
            <h2 className="text-2xl font-bold font-game mb-4">Analytics</h2>
            <p className="text-muted-foreground mb-6">
              View course enrollment statistics and user engagement metrics.
            </p>
            <LoadingButton
              disabled
              className="w-full md:w-auto font-game text-black"
              size="lg"
            >
              Coming Soon
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
