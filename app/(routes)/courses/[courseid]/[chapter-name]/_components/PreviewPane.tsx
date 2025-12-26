"use client";

import { useMemo } from "react";
import { QuestionType } from "@/types/chapter-content";

interface PreviewPaneProps {
  questionType: QuestionType;
  files: Record<string, string>;
  onClose: () => void;
}

export default function PreviewPane({
  questionType,
  files,
  onClose,
}: PreviewPaneProps) {
  const previewContent = useMemo(() => {
    if (questionType === "html-css-js") {
      const html = files["index.html"] || "";
      const css = files["style.css"] || "";
      const js = files["script.js"] || "";

      // Create a complete HTML document
      const fullHTML = html
        .replace(
          '<link rel="stylesheet" href="style.css">',
          `<style>${css}</style>`
        )
        .replace('<script src="script.js"></script>', `<script>${js}</script>`);

      return fullHTML;
    }
    return "";
  }, [files, questionType]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b-4 border-gray-800 bg-gray-800 p-2 flex items-center justify-between">
        <h2 className="font-game font-normal text-white text-lg flex items-center gap-2">
          [VIEW] Live Preview
        </h2>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-red-400 hover:bg-red-500 border-2 border-black font-game font-normal text-xs shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000]"
        >
          Close Preview
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative">
        {questionType === "html-css-js" && (
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        )}

        {questionType === "react" && (
          <div className="flex items-center justify-center h-full p-8 text-center">
            <div>
              <p className="text-xl font-game font-normal mb-4">[REACT] React Preview</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                React preview coming soon!
                <br />
                For now, test your code locally.
              </p>
            </div>
          </div>
        )}

        {questionType === "nodejs" && (
          <div className="flex items-center justify-center h-full p-8 text-center">
            <div>
              <p className="text-xl font-game font-normal mb-4">[NODE] Node.js API</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Server-side preview not available.
                <br />
                Run your code in a local Node.js environment.
              </p>
            </div>
          </div>
        )}

        {questionType === "typescript" && (
          <div className="flex items-center justify-center h-full p-8 text-center">
            <div>
              <p className="text-xl font-game font-normal mb-4">[TS] TypeScript</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                TypeScript preview coming soon!
                <br />
                Compile and run your code locally.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
