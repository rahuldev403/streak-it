"use client";

import { BoilerplateFile } from "@/types/chapter-content";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface FileViewerProps {
  files: BoilerplateFile[];
  fileContents: Record<string, string>;
  onCodeChange?: (fileName: string, code: string) => void;
  showPreviewWarningButton?: boolean;
}

export default function FileViewer({
  files,
  fileContents,
  onCodeChange,
  showPreviewWarningButton = false,
}: FileViewerProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);

  const activeFile = files[activeFileIndex];

  const getMonacoLanguage = (file: BoilerplateFile) => {
    const lang = String(file.language || "").toLowerCase();
    const name = file.name.toLowerCase();

    if (name.endsWith(".tsx") || name.endsWith(".ts")) return "typescript";
    if (name.endsWith(".jsx") || name.endsWith(".js")) return "javascript";
    if (name.endsWith(".css")) return "css";
    if (name.endsWith(".html")) return "html";
    if (name.endsWith(".json")) return "json";

    if (lang === "tsx" || lang === "typescript") return "typescript";
    if (lang === "jsx" || lang === "javascript") return "javascript";
    if (lang === "css" || lang === "html" || lang === "json") return lang;

    return "javascript";
  };

  const configureMonaco = (monaco: any) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      onCodeChange?.(activeFile.name, value);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* File Tabs */}
      <div className="flex border-b-4 border-gray-800 bg-gray-800">
        <div className="flex-1 flex overflow-x-auto">
          {files.map((file, index) => (
            <button
              key={file.name}
              onClick={() => setActiveFileIndex(index)}
              className={`px-4 py-2 font-game font-normal text-sm whitespace-nowrap transition-colors ${
                activeFileIndex === index
                  ? "bg-[#1e1e1e] text-yellow-400 border-b-4 border-yellow-400"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } ${file.readonly ? "italic" : ""}`}
            >
              {file.name}
              {file.readonly && " [LOCKED]"}
            </button>
          ))}
        </div>

        {showPreviewWarningButton && (
          <div className="shrink-0 border-l-2 border-black/70 p-1 bg-gray-700">
            <button
              onClick={() => setWarningOpen(true)}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-500 border-2 border-black font-game font-normal text-xs text-black shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000] transition-all flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              Warning
            </button>
          </div>
        )}
      </div>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent className="border-4 border-black dark:border-white bg-linear-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 shadow-[10px_10px_0_0_#000] dark:shadow-[10px_10px_0_0_#fff]">
          <DialogHeader>
            <DialogTitle className="font-game font-normal text-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Preview Requirements
            </DialogTitle>
            <DialogDescription className="font-comfortaa text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              Use an entry file like main.tsx/index.tsx/App.tsx (or jsx/js
              variants). Relative imports are supported, npm package imports are
              not.
            </DialogDescription>
          </DialogHeader>
          <div className="border-2 border-black/70 dark:border-white/70 bg-white/75 dark:bg-gray-900/60 p-3 rounded-md">
            <p className="font-game font-normal text-xs text-gray-700 dark:text-gray-200 mb-1">
              Supported entry names:
            </p>
            <p className="font-mono text-xs text-gray-800 dark:text-gray-100 break-all">
              main.tsx, index.tsx, App.tsx, app.tsx, main.jsx, index.jsx,
              App.jsx, app.jsx, main.ts, index.ts, main.js, index.js, script.js
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor */}
      <div className="flex-1 relative">
        {activeFile && (
          <Editor
            key={activeFile.name}
            height="100%"
            path={activeFile.name}
            language={getMonacoLanguage(activeFile)}
            value={fileContents[activeFile.name] || ""}
            onChange={handleEditorChange}
            beforeMount={configureMonaco}
            theme="vs-dark"
            options={{
              readOnly: activeFile.readonly,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily:
                "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
              fontLigatures: true,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
            }}
          />
        )}
      </div>
    </div>
  );
}
