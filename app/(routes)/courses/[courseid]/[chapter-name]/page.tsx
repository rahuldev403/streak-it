"use client";

import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChapterContentData } from "@/types/chapter-content";
import FileViewer from "./_components/FileViewer";
import ProblemStatement from "./_components/ProblemStatement";
import PreviewPane from "./_components/PreviewPane";
import { useParams, useRouter } from "next/navigation";
import {
  MonitorIcon,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import editor from "@/public/code-challange/code-editor.png";
const Page = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseid as string;
  const chapterName = params["chapter-name"] as string;

  const [content, setContent] = useState<ChapterContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Check if device is small (mobile/tablet)
  useEffect(() => {
    const checkDeviceSize = () => {
      setIsSmallDevice(window.innerWidth < 1024); // Block devices smaller than 1024px
    };

    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);

    return () => window.removeEventListener("resize", checkDeviceSize);
  }, []);

  useEffect(() => {
    fetchChapterId();
  }, [courseId, chapterName]);

  useEffect(() => {
    if (chapterId) {
      fetchChapterContent();
    }
  }, [chapterId]);

  const fetchChapterId = async () => {
    try {
      const response = await fetch(`/api/chapters?courseId=${courseId}`);
      const chapters = await response.json();

      const decodedChapterName = decodeURIComponent(chapterName);

      const matchingChapter = chapters.find(
        (ch: any) => ch.name === decodedChapterName
      );

      if (matchingChapter) {
        setChapterId(matchingChapter.id);
      }
    } catch (error) {
      console.error("Failed to fetch chapter ID:", error);
      setLoading(false);
    }
  };

  const fetchChapterContent = async () => {
    try {
      const response = await fetch(
        `/api/chapter-content?chapterId=${chapterId}`
      );
      const data = await response.json();

      if (data.contents && data.contents.length > 0) {
        const firstContent = data.contents[0];
        setContent(firstContent);

        const initialFiles = firstContent.boilerplateFiles.reduce(
          (
            acc: Record<string, string>,
            file: { name: string; content: string }
          ) => ({
            ...acc,
            [file.name]: file.content,
          }),
          {} as Record<string, string>
        );
        setFileContents(initialFiles);
      }
    } catch (error) {
      console.error("Failed to fetch chapter content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (fileName: string, code: string) => {
    setFileContents((prev) => ({ ...prev, [fileName]: code }));
  };

  const handleRunCode = () => {
    if (content?.questionType === "html-css-js") {
      setShowPreview(true);
    } else {
      toast.info("Preview not available for this question type yet!");
    }
  };

  const handleMarkComplete = async () => {
    if (!chapterId) {
      toast.error("Chapter ID not found. Please refresh the page.");
      return;
    }

    try {
      setIsMarkingComplete(true);

      // Get current chapter index
      const response = await fetch(`/api/chapters?courseId=${courseId}`);
      const chapters = await response.json();
      const decodedChapterName = decodeURIComponent(chapterName);
      const currentChapter = chapters.find(
        (ch: any) => ch.name === decodedChapterName
      );

      if (!currentChapter) {
        throw new Error("Chapter not found");
      }

      const chapterIndex = chapters.findIndex(
        (ch: any) => ch.id === currentChapter.id
      );

      // Update progress in the database
      await fetch("/api/enroll/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          progress: chapterIndex + 1,
        }),
      });

      toast.success("Chapter marked as complete!");

      // Navigate back to course page
      router.push(`/courses/${courseId}`);
    } catch (error) {
      console.error("Failed to mark chapter as complete:", error);
      toast.error("Failed to mark chapter as complete. Please try again.");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Block access on small devices
  if (isSmallDevice) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-73px)] w-full flex items-center justify-center px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md text-center border-4 border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <MonitorIcon className="w-20 h-20 mx-auto mb-6 text-orange-500" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-game font-normal text-2xl mb-4 text-gray-900 dark:text-white flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-6 h-6" />
            Desktop Required
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
          >
            The coding challenge editor requires a larger screen for the best
            experience.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-600 dark:text-gray-400 mb-6"
          >
            Please access this page from a desktop or laptop computer (minimum
            1024px width).
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/courses/${courseId}`)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black font-game font-normal shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Course
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-73px)] w-full flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-game font-normal text-xl"
          >
            Loading challenge...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (!content) {
    return (
      <div className="h-[calc(100vh-73px)] w-full flex items-center justify-center">
        <div className="text-center">
          <p className="font-game font-normal text-2xl mb-4 flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            No content found
          </p>
          <p className="text-gray-600">
            This chapter doesn&apos;t have any exercises yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100vh-73px)] w-full"
    >
      <Allotment>
        {/* Left Pane - Problem Statement or Preview */}
        <Allotment.Pane minSize={300}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-full border-4 border-gray-800 bg-white dark:bg-gray-900 m-2 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] overflow-hidden"
          >
            {showPreview ? (
              <PreviewPane
                questionType={content.questionType}
                files={fileContents}
                onClose={() => setShowPreview(false)}
              />
            ) : (
              <ProblemStatement content={content} />
            )}
          </motion.div>
        </Allotment.Pane>

        {/* Right Pane - Code Editor */}
        <Allotment.Pane minSize={300}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-full border-4 border-gray-800 bg-gray-900 m-2 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header with buttons */}
              <div className="border-b-4 border-gray-800 bg-gray-800 p-2 flex items-center justify-between">
                <h2 className="font-game font-normal text-white text-lg">
                  Code Editor {"..."}
                  {"<"}
                  <Image
                    src={editor}
                    alt="Code Editor"
                    className="w-5 h-5 inline-block"
                  />
                  {">"}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 border-2 border-black font-game font-normal text-xs shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000] transition-all"
                  >
                    Run
                  </button>
                  <button
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete}
                    className="px-3 py-1 bg-green-400 hover:bg-green-500 border-2 border-black font-game font-normal text-xs shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {isMarkingComplete ? (
                      "Saving..."
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Mark Complete
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* File Viewer with Monaco Editor */}
              <div className="flex-1 overflow-hidden">
                <FileViewer
                  files={content.boilerplateFiles}
                  fileContents={fileContents}
                  onCodeChange={handleCodeChange}
                />
              </div>
            </div>
          </motion.div>
        </Allotment.Pane>
      </Allotment>
    </motion.div>
  );
};

export default Page;
