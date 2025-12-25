"use client";
import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // User Management State
  const [userEmail, setUserEmail] = useState("");
  const [subscription, setSubscription] = useState("");

  // Course Management State
  const [courseData, setCourseData] = useState({
    courseId: "",
    title: "",
    description: "",
    bannerImage: "",
    level: "beginner",
    tags: "",
  });

  // Chapter Management State
  const [chapterData, setChapterData] = useState({
    courseId: "",
    name: "",
    desc: "",
    exercise: "",
  });

  useEffect(() => {
    if (isLoaded && user) {
      const userEmail = user.primaryEmailAddress?.emailAddress;
      if (!isAdmin(userEmail)) {
        toast.error("Access denied. Admin privileges required.");
        router.push("/dashboard");
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const userEmailCheck = user?.primaryEmailAddress?.emailAddress;
  if (!isAdmin(userEmailCheck)) {
    return null;
  }

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

  const handleUpdateSubscription = async () => {
    if (!userEmail || !subscription) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/admin/update-subscription", {
        email: userEmail,
        subscription,
      });

      if (response.data.success) {
        toast.success("Subscription updated successfully!");
        setUserEmail("");
        setSubscription("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      toast.error(
        error.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!courseData.courseId || !courseData.title || !courseData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/admin/add-course", courseData);

      if (response.data.success) {
        toast.success("Course added successfully!");
        setCourseData({
          courseId: "",
          title: "",
          description: "",
          bannerImage: "",
          level: "beginner",
          tags: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error("Error adding course:", error);
      toast.error(error.response?.data?.message || "Failed to add course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChapter = async () => {
    if (!chapterData.courseId || !chapterData.name || !chapterData.desc) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/admin/add-chapter", chapterData);

      if (response.data.success) {
        toast.success("Chapter added successfully!");
        setChapterData({
          courseId: "",
          name: "",
          desc: "",
          exercise: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error("Error adding chapter:", error);
      toast.error(error.response?.data?.message || "Failed to add chapter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedContent = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/admin/seed-content");

      if (response.data.success) {
        toast.success("Content seeded successfully!", {
          description: response.data.message,
          duration: 4000,
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error("Error seeding content:", error);
      toast.error(error.response?.data?.message || "Failed to seed content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center border-4 border-black p-6 bg-gradient-to-r from-purple-400/20 to-pink-400/20">
          <h1 className="text-4xl font-bold font-game text-primary mb-4">
            🔧 Admin Dashboard
          </h1>
          <p className="text-lg font-comfortaa">
            Manage users, courses, and content
          </p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 font-game">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* USER MANAGEMENT TAB */}
          <TabsContent value="users" className="space-y-4">
            <div className="border-4 border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-2xl font-bold font-game mb-4">
                👥 User Subscription Management
              </h2>
              <p className="text-muted-foreground mb-6 font-comfortaa">
                Update user subscription plans
              </p>

              <div className="space-y-4">
                <div>
                  <label className="font-game text-sm mb-2 block">
                    User Email
                  </label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="border-4 border-gray-800 rounded-none font-comfortaa"
                  />
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">
                    Subscription Plan
                  </label>
                  <Select value={subscription} onValueChange={setSubscription}>
                    <SelectTrigger className="border-4 border-gray-800 rounded-none font-game">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <LoadingButton
                  onClick={handleUpdateSubscription}
                  isLoading={isLoading}
                  variant="pixel"
                  className="w-full font-game"
                >
                  Update Subscription
                </LoadingButton>
              </div>
            </div>
          </TabsContent>

          {/* COURSE MANAGEMENT TAB */}
          <TabsContent value="courses" className="space-y-4">
            <div className="border-4 border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-2xl font-bold font-game mb-4">
                📚 Add New Course
              </h2>
              <p className="text-muted-foreground mb-6 font-comfortaa">
                Create a new course in the system
              </p>

              <div className="space-y-4">
                <div>
                  <label className="font-game text-sm mb-2 block">
                    Course ID (URL slug) *
                  </label>
                  <Input
                    placeholder="web-foundations"
                    value={courseData.courseId}
                    onChange={(e) =>
                      setCourseData({ ...courseData, courseId: e.target.value })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa"
                  />
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">
                    Course Title *
                  </label>
                  <Input
                    placeholder="Web Development Foundations"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa"
                  />
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Master the fundamentals of web development..."
                    value={courseData.description}
                    onChange={(e) =>
                      setCourseData({
                        ...courseData,
                        description: e.target.value,
                      })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">
                    Banner Image URL
                  </label>
                  <Input
                    placeholder="https://example.com/banner.jpg"
                    value={courseData.bannerImage}
                    onChange={(e) =>
                      setCourseData({
                        ...courseData,
                        bannerImage: e.target.value,
                      })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa"
                  />
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">Level</label>
                  <Select
                    value={courseData.level}
                    onValueChange={(value) =>
                      setCourseData({ ...courseData, level: value })
                    }
                  >
                    <SelectTrigger className="border-4 border-gray-800 rounded-none font-game">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">
                    Tags (comma separated)
                  </label>
                  <Input
                    placeholder="HTML, CSS, JavaScript"
                    value={courseData.tags}
                    onChange={(e) =>
                      setCourseData({ ...courseData, tags: e.target.value })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa"
                  />
                </div>

                <LoadingButton
                  onClick={handleAddCourse}
                  isLoading={isLoading}
                  variant="pixel"
                  className="w-full font-game"
                >
                  Add Course
                </LoadingButton>
              </div>
            </div>
          </TabsContent>

          {/* CHAPTER MANAGEMENT TAB */}
          <TabsContent value="chapters" className="space-y-4">
            <div className="border-4 border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-2xl font-bold font-game mb-4">
                📖 Add New Chapter
              </h2>
              <p className="text-muted-foreground mb-6 font-comfortaa">
                Add a chapter to an existing course
              </p>

              <div className="space-y-4">
                <div>
                  <label className="font-game text-sm mb-2 block">
                    Course ID *
                  </label>
                  <Input
                    placeholder="web-foundations"
                    value={chapterData.courseId}
                    onChange={(e) =>
                      setChapterData({
                        ...chapterData,
                        courseId: e.target.value,
                      })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa"
                  />
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">
                    Chapter Name *
                  </label>
                  <Input
                    placeholder="HTML Basics"
                    value={chapterData.name}
                    onChange={(e) =>
                      setChapterData({ ...chapterData, name: e.target.value })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa"
                  />
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Learn the basics of HTML structure..."
                    value={chapterData.desc}
                    onChange={(e) =>
                      setChapterData({ ...chapterData, desc: e.target.value })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="font-game text-sm mb-2 block">
                    Exercise (optional)
                  </label>
                  <Textarea
                    placeholder="Create a webpage with proper HTML structure..."
                    value={chapterData.exercise}
                    onChange={(e) =>
                      setChapterData({
                        ...chapterData,
                        exercise: e.target.value,
                      })
                    }
                    className="border-4 border-gray-800 rounded-none font-comfortaa min-h-[80px]"
                  />
                </div>

                <LoadingButton
                  onClick={handleAddChapter}
                  isLoading={isLoading}
                  variant="pixel"
                  className="w-full font-game"
                >
                  Add Chapter
                </LoadingButton>
              </div>
            </div>

            <div className="border-4 border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-2xl font-bold font-game mb-4">
                📦 Bulk Load Chapters
              </h2>
              <p className="text-muted-foreground mb-6 font-comfortaa">
                Load pre-defined sample chapters from database
              </p>

              <LoadingButton
                onClick={handleSaveChapters}
                isLoading={isLoading}
                variant="pixel"
                className="w-full font-game"
              >
                Load Sample Chapters
              </LoadingButton>
            </div>
          </TabsContent>

          {/* CONTENT MANAGEMENT TAB */}
          <TabsContent value="content" className="space-y-4">
            <div className="border-4 border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-2xl font-bold font-game mb-4">
                💾 Chapter Content (HTML/CSS/JS)
              </h2>
              <p className="text-muted-foreground mb-6 font-comfortaa">
                Load chapter content from scripts folder (HTML, CSS, JS
                exercises)
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-4 border-blue-500 p-4 mb-4">
                <p className="font-comfortaa text-sm">
                  ℹ️ This will load content from
                  /scripts/seed-all-course-content.ts for web-foundations course
                  chapters
                </p>
              </div>

              <LoadingButton
                onClick={handleSeedContent}
                isLoading={isLoading}
                variant="pixel"
                className="w-full font-game"
              >
                Seed Chapter Content
              </LoadingButton>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
