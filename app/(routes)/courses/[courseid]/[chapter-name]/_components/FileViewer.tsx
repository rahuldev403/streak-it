"use client";

import { BoilerplateFile } from "@/types/chapter-content";
import { useState } from "react";
import Editor from "@monaco-editor/react";

interface FileViewerProps {
  files: BoilerplateFile[];
  fileContents: Record<string, string>;
  onCodeChange?: (fileName: string, code: string) => void;
}

export default function FileViewer({
  files,
  fileContents,
  onCodeChange,
}: FileViewerProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);

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
      <div className="flex overflow-x-auto border-b-4 border-gray-800 bg-gray-800">
        {files.map((file, index) => (
          <button
            key={file.name}
            onClick={() => setActiveFileIndex(index)}
            className={`px-4 py-2 font-game font-normal text-sm whitespace-nowrap transition-colors ${
              activeFileIndex === index
                ? "bg-[#1e1e1e] text-yellow-400 border-b-4 border-yellow-400"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            } ${file.readonly ? "italic" : "font-semibold"}`}
          >
            {file.name}
            {file.readonly && " [LOCKED]"}
          </button>
        ))}
      </div>

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
