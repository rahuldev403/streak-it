"use client";

import { useEffect, useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { hasAdminAccess, isSuperAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseStyleLoader } from "@/components/ui/course-style-loader";
import { Switch } from "@/components/ui/switch";

interface CourseOption {
  id: number;
  courseId: string;
  title: string;
  description: string;
}

interface ChapterOption {
  id: number;
  courseId: string;
  name: string;
  desc: string;
  exercise?: string | null;
}

interface ExerciseDraftFile {
  name: string;
  content: string;
  language: string;
  readonly: boolean;
}

interface ExerciseDraftTestCase {
  id: string;
  input?: string;
  expectedOutput: string;
  description: string;
}

interface AdminListUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdminFromMetadata: boolean;
  isSuperAdmin: boolean;
}

type WebDevQuestionType =
  | "html-css-js"
  | "react"
  | "nextjs"
  | "nodejs"
  | "typescript";

const QUESTION_TYPE_LABELS: Record<WebDevQuestionType, string> = {
  "html-css-js": "HTML + CSS + JavaScript",
  react: "React",
  nextjs: "Next.js",
  nodejs: "Node.js + Express",
  typescript: "TypeScript",
};

const DELETE_CONFIRM_TOKEN = "DELETE";

const SURFACE_CARD_CLASS =
  "rounded-3xl border border-black/15 dark:border-white/15 bg-white/85 dark:bg-gray-900/75 backdrop-blur-sm shadow-[0_16px_50px_rgba(0,0,0,0.14)] p-6 md:p-7 space-y-5";

const FIELD_CLASS =
  "rounded-xl border-2 border-black/20 dark:border-white/20 bg-white/80 dark:bg-gray-950/70 font-comfortaa focus-visible:ring-2 focus-visible:ring-sky-500/60";

const MONO_FIELD_CLASS =
  "rounded-xl border-2 border-black/20 dark:border-white/20 bg-gray-950 text-gray-100 font-mono focus-visible:ring-2 focus-visible:ring-sky-500/60";

const TABS_TRIGGER_CLASS =
  "rounded-xl border border-transparent data-[state=active]:border-black/15 dark:data-[state=active]:border-white/20 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-900/80 data-[state=active]:shadow-sm";

const AdminPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [contentImportLoading, setContentImportLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [chapterContentJsonText, setChapterContentJsonText] = useState("");
  const [contentImportData, setContentImportData] = useState({
    courseId: "",
    chapterId: "",
    questionType: "react" as WebDevQuestionType,
    overwriteExisting: true,
  });
  const [importPayloadType, setImportPayloadType] = useState<
    "chapter-packages" | "existing-chapter"
  >("chapter-packages");
  const [contentImportChapters, setContentImportChapters] = useState<
    ChapterOption[]
  >([]);
  const [courseDeleteConfirmText, setCourseDeleteConfirmText] = useState("");
  const [chapterDeleteConfirmText, setChapterDeleteConfirmText] = useState("");
  const [manageCourseId, setManageCourseId] = useState("");
  const [manageChapterId, setManageChapterId] = useState("");
  const [manageChapters, setManageChapters] = useState<ChapterOption[]>([]);
  const [superAdminTargetEmail, setSuperAdminTargetEmail] = useState("");
  const [superAdminGrantLoading, setSuperAdminGrantLoading] = useState(false);
  const [superAdminMakeAdmin, setSuperAdminMakeAdmin] = useState(true);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminListUser[]>([]);

  const [manageCourseData, setManageCourseData] = useState({
    title: "",
    description: "",
    bannerImage: "",
    level: "beginner",
    tags: "",
  });

  const [manageChapterData, setManageChapterData] = useState({
    name: "",
    desc: "",
    exercise: "",
  });

  const [courseData, setCourseData] = useState({
    courseId: "",
    title: "",
    description: "",
    bannerImage: "",
    level: "beginner",
    tags: "",
  });

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await axios.get("/api/courses/list");
      setCourses(response.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadContentImportChapters = async (courseId: string) => {
    if (!courseId) {
      setContentImportChapters([]);
      return;
    }

    setChaptersLoading(true);
    try {
      const response = await axios.get(`/api/chapters?courseId=${courseId}`);
      setContentImportChapters(response.data || []);
    } catch (error) {
      console.error("Failed to fetch chapters for content import:", error);
      toast.error("Failed to load chapters for content import");
    } finally {
      setChaptersLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!hasAdminAccess(userEmail, user.publicMetadata?.isAdmin)) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/dashboard");
      return;
    }

    loadCourses();
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (contentImportData.courseId) {
      loadContentImportChapters(contentImportData.courseId);
    } else {
      setContentImportChapters([]);
    }
  }, [contentImportData.courseId]);

  useEffect(() => {
    const selected = courses.find(
      (course) => course.courseId === manageCourseId,
    );
    if (!selected) {
      setManageCourseData({
        title: "",
        description: "",
        bannerImage: "",
        level: "beginner",
        tags: "",
      });
      setManageChapters([]);
      setManageChapterId("");
      return;
    }

    setManageCourseData((prev) => ({
      ...prev,
      title: selected.title,
      description: selected.description,
    }));

    const loadManageChapters = async () => {
      try {
        const response = await axios.get(
          `/api/chapters?courseId=${manageCourseId}`,
        );
        setManageChapters(response.data || []);
      } catch (error) {
        console.error("Failed to load chapters for management:", error);
        toast.error("Failed to load chapters for management");
      }
    };

    loadManageChapters();
  }, [manageCourseId, courses]);

  useEffect(() => {
    const selected = manageChapters.find(
      (chapter) => String(chapter.id) === manageChapterId,
    );

    if (!selected) {
      setManageChapterData({ name: "", desc: "", exercise: "" });
      return;
    }

    setManageChapterData({
      name: selected.name,
      desc: selected.desc,
      exercise: selected.exercise || "",
    });
  }, [manageChapterId, manageChapters]);

  const loadAdminUsers = async () => {
    setAdminUsersLoading(true);
    try {
      const response = await axios.get(
        "/api/admin/super-admin/manage-user-admin",
      );
      if (!response.data.success) {
        toast.error(response.data.error || "Failed to load admin users");
        return;
      }
      setAdminUsers(response.data.users || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load admin users");
    } finally {
      setAdminUsersLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;
    if (!isSuperAdmin(email)) return;

    loadAdminUsers();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CourseStyleLoader className="py-0" />
      </div>
    );
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isCurrentUserSuperAdmin = isSuperAdmin(userEmail);

  if (!hasAdminAccess(userEmail, user?.publicMetadata?.isAdmin)) {
    return null;
  }

  const handleAddCourse = async () => {
    if (!courseData.courseId || !courseData.title || !courseData.description) {
      toast.error("Please fill all required course fields");
      return;
    }

    setFormLoading(true);
    try {
      const response = await axios.post("/api/admin/add-course", {
        courseId: courseData.courseId,
        title: courseData.title,
        description: courseData.description,
        bannerImage: courseData.bannerImage,
        level: courseData.level,
        tags: courseData.tags,
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to create course");
        return;
      }

      toast.success("Web-dev course created successfully");
      setCourseData({
        courseId: "",
        title: "",
        description: "",
        bannerImage: "",
        level: "beginner",
        tags: "",
      });
      await loadCourses();
    } catch (error: any) {
      console.error("Error adding course:", error);
      toast.error(error.response?.data?.message || "Failed to add course");
    } finally {
      setFormLoading(false);
    }
  };

  const handleImportChapterContentOnly = async () => {
    if (!contentImportData.courseId) {
      toast.error("Select course first");
      return;
    }

    if (!chapterContentJsonText.trim()) {
      toast.error("Paste chapter content JSON first");
      return;
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(chapterContentJsonText);
    } catch {
      toast.error("Invalid JSON format for chapter content");
      return;
    }

    const isChapterPackageObject =
      !!parsedPayload &&
      typeof parsedPayload === "object" &&
      !Array.isArray(parsedPayload) &&
      Array.isArray(
        (parsedPayload as { chapterPackages?: unknown[] }).chapterPackages,
      );

    const isChapterPackageArray =
      Array.isArray(parsedPayload) &&
      parsedPayload.length > 0 &&
      parsedPayload.every(
        (item) =>
          !!item &&
          typeof item === "object" &&
          ("chapter" in (item as object) || "name" in (item as object)),
      );

    const isCombinedChapterPackagePayload =
      isChapterPackageObject || isChapterPackageArray;
    const isArrayPayload = Array.isArray(parsedPayload);

    setContentImportLoading(true);
    try {
      if (importPayloadType === "chapter-packages") {
        if (!isCombinedChapterPackagePayload) {
          toast.error(
            "Expected chapterPackages payload. Switch import type if using draft/drafts JSON.",
          );
          return;
        }

        const chapterPackages = isChapterPackageObject
          ? (parsedPayload as { chapterPackages: unknown[] }).chapterPackages
          : (parsedPayload as unknown[]);

        const response = await axios.post("/api/admin/import-webdev-json", {
          courseId: contentImportData.courseId,
          questionType: contentImportData.questionType,
          chapterPackages,
          overwriteExisting: contentImportData.overwriteExisting,
        });

        if (!response.data.success) {
          toast.error(
            response.data.error || "Failed to import chapter packages",
          );
          return;
        }

        toast.success("Chapter packages imported successfully", {
          description: `Chapters: ${response.data.summary?.chaptersProcessed || 0} | Exercises: ${response.data.summary?.exercisesImported || 0}`,
        });

        setChapterContentJsonText("");
        await loadContentImportChapters(contentImportData.courseId);
        return;
      }

      let targetChapterId = Number(contentImportData.chapterId);
      let targetChapterName =
        contentImportChapters.find(
          (chapter) => String(chapter.id) === contentImportData.chapterId,
        )?.name || contentImportData.chapterId;

      if (!contentImportData.chapterId) {
        toast.error("Select an existing chapter first");
        return;
      }

      if (isCombinedChapterPackagePayload) {
        toast.error(
          "Detected chapterPackages JSON. Change Import Payload Type to 'Chapter Packages JSON'.",
        );
        return;
      }

      const response = await axios.post("/api/admin/import-webdev-json", {
        courseId: contentImportData.courseId,
        chapterId: targetChapterId,
        questionType: contentImportData.questionType,
        ...(isArrayPayload
          ? { drafts: parsedPayload }
          : { draft: parsedPayload }),
        overwriteExisting: contentImportData.overwriteExisting,
      });

      if (!response.data.success) {
        toast.error(response.data.error || "Failed to import chapter content");
        return;
      }

      const importedCount = Number(
        response.data.summary?.exercisesImported || 1,
      );
      toast.success(
        importedCount > 1
          ? "Challenges imported successfully"
          : "Chapter content imported successfully",
        {
          description: `Chapter: ${response.data.summary?.chapterName || targetChapterName} | Imported: ${importedCount}`,
        },
      );

      setChapterContentJsonText("");
    } catch (error: any) {
      console.error("Content-only import failed:", error);
      toast.error(
        error.response?.data?.error || "Failed to import chapter content",
      );
    } finally {
      setContentImportLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!manageCourseId) {
      toast.error("Select a course first");
      return;
    }

    setManageLoading(true);
    try {
      const response = await axios.patch("/api/admin/manage-course", {
        courseId: manageCourseId,
        ...manageCourseData,
      });

      if (!response.data.success) {
        toast.error(response.data.error || "Failed to update course");
        return;
      }

      toast.success("Course updated successfully");
      await loadCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update course");
    } finally {
      setManageLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!manageCourseId) {
      toast.error("Select a course first");
      return;
    }

    if (courseDeleteConfirmText.trim() !== DELETE_CONFIRM_TOKEN) {
      toast.error("Type DELETE to confirm course deletion");
      return;
    }

    const confirmed = window.confirm(
      "Delete this course and all its chapters/content? This cannot be undone.",
    );
    if (!confirmed) return;

    setManageLoading(true);
    try {
      const response = await axios.delete("/api/admin/manage-course", {
        data: { courseId: manageCourseId, deleteDependents: true },
      });

      if (!response.data.success) {
        toast.error(response.data.error || "Failed to delete course");
        return;
      }

      toast.success("Course deleted successfully");
      setManageCourseId("");
      setCourseDeleteConfirmText("");
      await loadCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete course");
    } finally {
      setManageLoading(false);
    }
  };

  const handleUpdateChapter = async () => {
    if (!manageChapterId) {
      toast.error("Select a chapter first");
      return;
    }

    setManageLoading(true);
    try {
      const response = await axios.patch("/api/admin/manage-chapter", {
        chapterId: Number(manageChapterId),
        ...manageChapterData,
      });

      if (!response.data.success) {
        toast.error(response.data.error || "Failed to update chapter");
        return;
      }

      toast.success("Chapter updated successfully");
      const chapterResponse = await axios.get(
        `/api/chapters?courseId=${manageCourseId}`,
      );
      setManageChapters(chapterResponse.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update chapter");
    } finally {
      setManageLoading(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!manageChapterId) {
      toast.error("Select a chapter first");
      return;
    }

    if (chapterDeleteConfirmText.trim() !== DELETE_CONFIRM_TOKEN) {
      toast.error("Type DELETE to confirm chapter deletion");
      return;
    }

    const confirmed = window.confirm(
      "Delete this chapter and all its content? This cannot be undone.",
    );
    if (!confirmed) return;

    setManageLoading(true);
    try {
      const response = await axios.delete("/api/admin/manage-chapter", {
        data: { chapterId: Number(manageChapterId), deleteContent: true },
      });

      if (!response.data.success) {
        toast.error(response.data.error || "Failed to delete chapter");
        return;
      }

      toast.success("Chapter deleted successfully");
      const chapterResponse = await axios.get(
        `/api/chapters?courseId=${manageCourseId}`,
      );
      setManageChapters(chapterResponse.data || []);
      setManageChapterId("");
      setChapterDeleteConfirmText("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete chapter");
    } finally {
      setManageLoading(false);
    }
  };

  const handleManageUserAdminAccess = async () => {
    const email = superAdminTargetEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid user email");
      return;
    }

    setSuperAdminGrantLoading(true);
    try {
      const response = await axios.post(
        "/api/admin/super-admin/manage-user-admin",
        {
          email,
          makeAdmin: superAdminMakeAdmin,
        },
      );

      if (!response.data.success) {
        toast.error(response.data.error || "Failed to update admin access");
        return;
      }

      toast.success(response.data.message || "User admin access updated");
      setSuperAdminTargetEmail("");
      await loadAdminUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to update admin access",
      );
    } finally {
      setSuperAdminGrantLoading(false);
    }
  };

  return (
    <div className="relative container mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.23),transparent_45%),radial-gradient(circle_at_80%_5%,rgba(16,185,129,0.2),transparent_40%)]" />
      <div className="space-y-7">
        <div className="rounded-3xl border border-black/15 dark:border-white/15 bg-linear-to-r from-sky-500/15 via-white/70 to-emerald-500/15 dark:from-sky-500/20 dark:via-gray-900/75 dark:to-emerald-500/20 shadow-[0_16px_50px_rgba(0,0,0,0.14)] p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-game font-normal text-primary mb-3">
            Admin Web Dev Control
          </h1>
          <p className="text-sm md:text-base font-comfortaa text-gray-700 dark:text-gray-300 max-w-2xl">
            Build and maintain web-development courses with chapter-level
            broken-code exercises.
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList
            className={`grid w-full ${
              isCurrentUserSuperAdmin ? "grid-cols-4" : "grid-cols-3"
            } rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-gray-900/55 backdrop-blur-sm p-1.5 font-game font-normal h-auto`}
          >
            <TabsTrigger value="manual" className={TABS_TRIGGER_CLASS}>
              Courses
            </TabsTrigger>
            <TabsTrigger value="json-import" className={TABS_TRIGGER_CLASS}>
              Chapter + Exercise JSON
            </TabsTrigger>
            <TabsTrigger value="manage" className={TABS_TRIGGER_CLASS}>
              Manage Existing
            </TabsTrigger>
            {isCurrentUserSuperAdmin && (
              <TabsTrigger value="super-admin" className={TABS_TRIGGER_CLASS}>
                Super Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className={SURFACE_CARD_CLASS}>
              <h2 className="text-2xl font-game font-normal mb-4">
                Create Web-Development Course
              </h2>
              <p className="text-muted-foreground mb-6 font-comfortaa">
                Every course created here is automatically tagged as
                subject:web-dev.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="font-game font-normal text-sm mb-2 block">
                    Course ID (URL slug) *
                  </label>
                  <Input
                    placeholder="nextjs-auth-debugging"
                    value={courseData.courseId}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        courseId: e.target.value,
                      }))
                    }
                    className={FIELD_CLASS}
                  />
                </div>

                <div>
                  <label className="font-game font-normal text-sm mb-2 block">
                    Course Title *
                  </label>
                  <Input
                    placeholder="Practical Next.js Debugging"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className={FIELD_CLASS}
                  />
                </div>

                <div>
                  <label className="font-game font-normal text-sm mb-2 block">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Teach practical debugging workflows for modern web applications..."
                    value={courseData.description}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className={`${FIELD_CLASS} min-h-25`}
                  />
                </div>

                <div>
                  <label className="font-game font-normal text-sm mb-2 block">
                    Banner Image URL
                  </label>
                  <Input
                    placeholder="https://example.com/banner.png"
                    value={courseData.bannerImage}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        bannerImage: e.target.value,
                      }))
                    }
                    className={FIELD_CLASS}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-game font-normal text-sm mb-2 block">
                      Level
                    </label>
                    <Select
                      value={courseData.level}
                      onValueChange={(value) =>
                        setCourseData((prev) => ({ ...prev, level: value }))
                      }
                    >
                      <SelectTrigger
                        className={`${FIELD_CLASS} font-game font-normal`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="font-game font-normal text-sm mb-2 block">
                      Extra Tags (comma separated)
                    </label>
                    <Input
                      placeholder="frontend, api, debugging"
                      value={courseData.tags}
                      onChange={(e) =>
                        setCourseData((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>

                <LoadingButton
                  onClick={handleAddCourse}
                  loading={formLoading}
                  className="w-full font-game font-normal"
                >
                  Create Web-Dev Course
                </LoadingButton>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="json-import" className="space-y-4">
            <div className={SURFACE_CARD_CLASS}>
              <h2 className="text-2xl font-game font-normal">
                Chapter + Exercise JSON Import
              </h2>
              <p className="text-muted-foreground font-comfortaa">
                Choose a course and existing chapter for normal imports, or
                paste a combined `chapterPackages` payload in the main JSON box
                to create/update chapter metadata and challenges together.
              </p>

              <div>
                <label className="font-game font-normal text-sm mb-2 block">
                  Import Payload Type
                </label>
                <Select
                  value={importPayloadType}
                  onValueChange={(
                    value: "chapter-packages" | "existing-chapter",
                  ) => setImportPayloadType(value)}
                >
                  <SelectTrigger
                    className={`${FIELD_CLASS} font-game font-normal`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chapter-packages">
                      Chapter Packages JSON (recommended)
                    </SelectItem>
                    <SelectItem value="existing-chapter">
                      Existing Chapter Draft JSON
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-game font-normal text-sm mb-2 block">
                    Existing Course *
                  </label>
                  <Select
                    value={contentImportData.courseId}
                    onValueChange={(value) =>
                      setContentImportData((prev) => ({
                        ...prev,
                        courseId: value,
                        chapterId: "",
                      }))
                    }
                  >
                    <SelectTrigger
                      className={`${FIELD_CLASS} font-game font-normal`}
                    >
                      <SelectValue
                        placeholder={
                          coursesLoading
                            ? "Loading courses..."
                            : "Select course"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.courseId}>
                          {course.title} ({course.courseId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {importPayloadType === "existing-chapter" && (
                <div>
                  <label className="font-game font-normal text-sm mb-2 block">
                    Existing Chapter *
                  </label>
                  <Select
                    value={contentImportData.chapterId}
                    onValueChange={(value) =>
                      setContentImportData((prev) => ({
                        ...prev,
                        chapterId: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      className={`${FIELD_CLASS} font-game font-normal`}
                    >
                      <SelectValue
                        placeholder={
                          contentImportData.courseId
                            ? chaptersLoading
                              ? "Loading chapters..."
                              : "Select chapter"
                            : "Choose a course first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {contentImportChapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={String(chapter.id)}>
                          {chapter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-game font-normal text-sm mb-2 block">
                    Stack Type
                  </label>
                  <Select
                    value={contentImportData.questionType}
                    onValueChange={(value: WebDevQuestionType) =>
                      setContentImportData((prev) => ({
                        ...prev,
                        questionType: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      className={`${FIELD_CLASS} font-game font-normal`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(QUESTION_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end justify-between rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-gray-950/35 p-3">
                  <p className="font-comfortaa text-sm">
                    Overwrite existing content
                  </p>
                  <Switch
                    checked={contentImportData.overwriteExisting}
                    onCheckedChange={(checked) =>
                      setContentImportData((prev) => ({
                        ...prev,
                        overwriteExisting: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Textarea
                placeholder='{"chapterPackages":[{"chapter":{"name":"...","desc":"...","exercise":"..."},"questionType":"react","drafts":[{"title":"...","problemStatement":"...","instructions":"...","expectedOutput":"...","hints":"...","solutionCode":"...","boilerplateFiles":[...],"testCases":[...]}]}]}'
                value={chapterContentJsonText}
                onChange={(e) => setChapterContentJsonText(e.target.value)}
                className={`${MONO_FIELD_CLASS} text-xs min-h-90`}
              />

              <details className="rounded-xl border border-black/15 dark:border-white/15 bg-white/60 dark:bg-gray-900/35 p-3">
                <summary className="cursor-pointer font-game font-normal text-xs">
                  Sample exercise JSON payloads
                </summary>
                <pre className="mt-2 text-xs font-mono whitespace-pre-wrap wrap-break-word">
                  {`{
  "title": "Fix state update bug",
  "problemStatement": "The todo list does not re-render after adding an item.",
  "instructions": "Do not mutate state directly. Return a new array.",
  "expectedOutput": "New todo appears immediately.",
  "hints": "Use setTodos(prev => [...prev, newTodo])",
  "solutionCode": "// your solution...",
  "boilerplateFiles": [
    { "name": "app.jsx", "content": "...", "language": "jsx", "readonly": false }
  ],
  "testCases": [
    { "id": "tc-1", "expectedOutput": "renders new item", "description": "adds one todo" }
  ]
}

[
  {
    "questionType": "react",
    "draft": {
      "title": "Fix stale state",
      "problemStatement": "...",
      "instructions": "...",
      "expectedOutput": "...",
      "hints": "...",
      "solutionCode": "...",
      "boilerplateFiles": [{ "name": "app.jsx", "content": "...", "language": "jsx", "readonly": false }],
      "testCases": [{ "id": "tc-1", "expectedOutput": "...", "description": "..." }]
    }
  }
]`}
                </pre>
                <pre className="mt-3 text-xs font-mono whitespace-pre-wrap wrap-break-word">
                  {`{
  "chapterPackages": [
    {
      "chapter": {
        "name": "Debug React State",
        "desc": "Fix state mutation and rerender issues.",
        "exercise": "Use immutable updates"
      },
      "questionType": "react",
      "drafts": [
        {
          "title": "Fix push mutation",
          "problemStatement": "Todo list does not update",
          "instructions": "Avoid mutating previous state",
          "expectedOutput": "New todo appears",
          "hints": "setTodos(prev => [...prev, newTodo])",
          "solutionCode": "...",
          "boilerplateFiles": [{ "name": "app.jsx", "content": "...", "language": "jsx", "readonly": false }],
          "testCases": [{ "id": "tc-1", "expectedOutput": "renders new item", "description": "adds one todo" }]
        }
      ]
    },
    {
      "name": "Fix Effect Dependencies",
      "desc": "Repair stale closure issues",
      "questionType": "react",
      "draft": {
        "title": "Fix stale interval",
        "problemStatement": "...",
        "instructions": "...",
        "expectedOutput": "...",
        "hints": "...",
        "solutionCode": "...",
        "boilerplateFiles": [{ "name": "app.jsx", "content": "...", "language": "jsx", "readonly": false }],
        "testCases": [{ "id": "tc-1", "expectedOutput": "...", "description": "..." }]
      }
    }
  ]
}`}
                </pre>
              </details>

              <LoadingButton
                onClick={handleImportChapterContentOnly}
                loading={contentImportLoading}
                className="w-full font-game font-normal"
              >
                Import Exercise JSON
              </LoadingButton>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <div className={SURFACE_CARD_CLASS}>
              <h2 className="text-2xl font-game font-normal">Manage Course</h2>

              <div>
                <label className="font-game font-normal text-sm mb-2 block">
                  Course
                </label>
                <Select
                  value={manageCourseId}
                  onValueChange={setManageCourseId}
                >
                  <SelectTrigger
                    className={`${FIELD_CLASS} font-game font-normal`}
                  >
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.courseId}>
                        {course.title} ({course.courseId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Course title"
                  value={manageCourseData.title}
                  onChange={(e) =>
                    setManageCourseData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className={FIELD_CLASS}
                />
                <Input
                  placeholder="Banner image URL"
                  value={manageCourseData.bannerImage}
                  onChange={(e) =>
                    setManageCourseData((prev) => ({
                      ...prev,
                      bannerImage: e.target.value,
                    }))
                  }
                  className={FIELD_CLASS}
                />
              </div>

              <Textarea
                placeholder="Course description"
                value={manageCourseData.description}
                onChange={(e) =>
                  setManageCourseData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={`${FIELD_CLASS} min-h-24`}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Level"
                  value={manageCourseData.level}
                  onChange={(e) =>
                    setManageCourseData((prev) => ({
                      ...prev,
                      level: e.target.value,
                    }))
                  }
                  className={FIELD_CLASS}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={manageCourseData.tags}
                  onChange={(e) =>
                    setManageCourseData((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  className={FIELD_CLASS}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <LoadingButton
                  onClick={handleUpdateCourse}
                  loading={manageLoading}
                  className="w-full font-game font-normal"
                >
                  Update Course
                </LoadingButton>
                <Input
                  placeholder="Type DELETE to enable deletion"
                  value={courseDeleteConfirmText}
                  onChange={(e) => setCourseDeleteConfirmText(e.target.value)}
                  className={`${FIELD_CLASS} border-red-500/70`}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <LoadingButton
                  onClick={handleDeleteCourse}
                  loading={manageLoading}
                  className="w-full font-game font-normal"
                >
                  Delete Course
                </LoadingButton>
                <p className="text-xs font-comfortaa text-muted-foreground self-center">
                  Deletion requires typing `DELETE` and confirmation popup.
                </p>
              </div>
            </div>

            <div className={SURFACE_CARD_CLASS}>
              <h2 className="text-2xl font-game font-normal">Manage Chapter</h2>

              <div>
                <label className="font-game font-normal text-sm mb-2 block">
                  Chapter
                </label>
                <Select
                  value={manageChapterId}
                  onValueChange={setManageChapterId}
                >
                  <SelectTrigger
                    className={`${FIELD_CLASS} font-game font-normal`}
                  >
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {manageChapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={String(chapter.id)}>
                        {chapter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Chapter name"
                value={manageChapterData.name}
                onChange={(e) =>
                  setManageChapterData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className={FIELD_CLASS}
              />

              <Textarea
                placeholder="Chapter description"
                value={manageChapterData.desc}
                onChange={(e) =>
                  setManageChapterData((prev) => ({
                    ...prev,
                    desc: e.target.value,
                  }))
                }
                className={`${FIELD_CLASS} min-h-20`}
              />

              <Textarea
                placeholder="Chapter exercise text"
                value={manageChapterData.exercise}
                onChange={(e) =>
                  setManageChapterData((prev) => ({
                    ...prev,
                    exercise: e.target.value,
                  }))
                }
                className={`${FIELD_CLASS} min-h-16`}
              />

              <div className="grid md:grid-cols-2 gap-3">
                <LoadingButton
                  onClick={handleUpdateChapter}
                  loading={manageLoading}
                  className="w-full font-game font-normal"
                >
                  Update Chapter
                </LoadingButton>
                <Input
                  placeholder="Type DELETE to enable deletion"
                  value={chapterDeleteConfirmText}
                  onChange={(e) => setChapterDeleteConfirmText(e.target.value)}
                  className={`${FIELD_CLASS} border-red-500/70`}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <LoadingButton
                  onClick={handleDeleteChapter}
                  loading={manageLoading}
                  className="w-full font-game font-normal"
                >
                  Delete Chapter
                </LoadingButton>
                <p className="text-xs font-comfortaa text-muted-foreground self-center">
                  Deletion requires typing `DELETE` and confirmation popup.
                </p>
              </div>
            </div>
          </TabsContent>

          {isCurrentUserSuperAdmin && (
            <TabsContent value="super-admin" className="space-y-4">
              <div className={SURFACE_CARD_CLASS}>
                <h2 className="text-2xl font-game font-normal">
                  Super Admin Controls
                </h2>
                <p className="text-muted-foreground font-comfortaa">
                  Grant or remove platform admin access for any registered user.
                </p>

                <div>
                  <label className="font-game font-normal text-sm mb-2 block">
                    User Email
                  </label>
                  <Input
                    placeholder="user@example.com"
                    value={superAdminTargetEmail}
                    onChange={(e) => setSuperAdminTargetEmail(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>

                <div className="flex items-end justify-between rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-gray-950/35 p-3">
                  <p className="font-comfortaa text-sm">
                    Enable admin access for this user
                  </p>
                  <Switch
                    checked={superAdminMakeAdmin}
                    onCheckedChange={setSuperAdminMakeAdmin}
                  />
                </div>

                <LoadingButton
                  onClick={handleManageUserAdminAccess}
                  loading={superAdminGrantLoading}
                  className="w-full font-game font-normal"
                >
                  {superAdminMakeAdmin
                    ? "Grant Admin Access"
                    : "Remove Admin Access"}
                </LoadingButton>

                <div className="rounded-2xl border border-black/15 dark:border-white/15 bg-white/65 dark:bg-gray-950/40 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-game font-normal text-sm">
                      Current Admin Users
                    </p>
                    <LoadingButton
                      onClick={loadAdminUsers}
                      loading={adminUsersLoading}
                      className="font-game font-normal"
                    >
                      Refresh
                    </LoadingButton>
                  </div>

                  {adminUsers.length === 0 ? (
                    <p className="text-sm font-comfortaa text-muted-foreground">
                      No admin users found.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {adminUsers.map((adminUser) => (
                        <div
                          key={adminUser.id}
                          className="rounded-xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-gray-900/65 px-3 py-2"
                        >
                          <p className="font-comfortaa text-sm break-all">
                            {adminUser.email}
                          </p>
                          <p className="font-comfortaa text-xs text-muted-foreground">
                            {(adminUser.firstName || "") +
                              (adminUser.lastName
                                ? ` ${adminUser.lastName}`
                                : "") || "No name"}
                          </p>
                          <p className="font-comfortaa text-xs text-muted-foreground">
                            {adminUser.isSuperAdmin
                              ? "Role source: super-admin env"
                              : "Role source: user metadata"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
