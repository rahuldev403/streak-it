"use client";

import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { useState, useEffect } from "react";
import { ChapterContentData } from "@/types/chapter-content";
import FileViewer from "./_components/FileViewer";
import ProblemStatement from "./_components/ProblemStatement";
import PreviewPane from "./_components/PreviewPane";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams();
  const chapterId = params.courseid; // This would need to be the actual chapter ID

  const [content, setContent] = useState<ChapterContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchChapterContent();
  }, [chapterId]);

  const fetchChapterContent = async () => {
    try {
      // For now, we'll use a hardcoded chapter ID (1)
      // In production, you'd get this from the route params or chapter selection
      const response = await fetch(`/api/chapter-content?chapterId=1`);
      const data = await response.json();

      if (data.contents && data.contents.length > 0) {
        const firstContent = data.contents[0];
        setContent(firstContent);

        // Initialize file contents
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
                <h2 className="font-game text-white text-lg">💻 Code Editor</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 border-2 border-black font-game text-xs shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000] transition-all"
                  >
                    [RUN] Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-3 py-1 bg-green-400 hover:bg-green-500 border-2 border-black font-game text-xs shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000] transition-all"
                  >
                    [OK] Submit
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
