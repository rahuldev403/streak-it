"use client";

import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { useState, useEffect } from "react";
import { ChapterContentData } from "@/types/chapter-content";
import FileViewer from "./_components/FileViewer";
import ProblemStatement from "./_components/ProblemStatement";
import PreviewPane from "./_components/PreviewPane";
import { useParams, useRouter } from "next/navigation";
import { MonitorIcon } from "lucide-react";
import Image from "next/image";
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
          (acc: Record<string, string>, file) => ({
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
      alert("Preview not available for this question type yet!");
    }
  };

  const handleSubmit = () => {
    // TODO: Implement submission logic
    alert("Submission feature coming soon!");
  };

  // Block access on small devices
  if (isSmallDevice) {
    return (
      <div className="h-[calc(100vh-73px)] w-full flex items-center justify-center px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md text-center border-4 border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
          <MonitorIcon className="w-20 h-20 mx-auto mb-6 text-orange-500" />
          <h2 className="font-game text-2xl mb-4 text-gray-900 dark:text-white">
            [!] Desktop Required
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            The coding challenge editor requires a larger screen for the best
            experience.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please access this page from a desktop or laptop computer (minimum
            1024px width).
          </p>
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black font-game shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            [←] Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-73px)] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="font-game text-xl">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-[calc(100vh-73px)] w-full flex items-center justify-center">
        <div className="text-center">
          <p className="font-game text-2xl mb-4">[!] No content found</p>
          <p className="text-gray-600">
            This chapter doesn&apos;t have any exercises yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-73px)] w-full">
      <Allotment>
        {/* Left Pane - Problem Statement or Preview */}
        <Allotment.Pane minSize={300}>
          <div className="h-full border-4 border-gray-800 bg-white dark:bg-gray-900 m-2 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] overflow-hidden">
            {showPreview ? (
              <PreviewPane
                questionType={content.questionType}
                files={fileContents}
                onClose={() => setShowPreview(false)}
              />
            ) : (
              <ProblemStatement content={content} />
            )}
          </div>
        </Allotment.Pane>

        {/* Right Pane - Code Editor */}
        <Allotment.Pane minSize={300}>
          <div className="h-full border-4 border-gray-800 bg-gray-900 m-2 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Header with buttons */}
              <div className="border-b-4 border-gray-800 bg-gray-800 p-2 flex items-center justify-between">
                <h2 className="font-game text-white text-lg">
                  {" "}
                  <Image
                    src={editor}
                    alt="Code Editor"
                    className="w-5 h-5 inline-block mr-2"
                  />{" "}
                  Code Editor
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 border-2 border-black font-game text-xs shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000] transition-all"
                  >
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-3 py-1 bg-green-400 hover:bg-green-500 border-2 border-black font-game text-xs shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000] transition-all"
                  >
                    Submit
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
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default Page;
