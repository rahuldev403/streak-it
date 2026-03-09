"use client";

import { useMemo, useState } from "react";
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
  const [unsupportedImgSrc, setUnsupportedImgSrc] = useState("/notsupport.png");

  const isIframePreviewType =
    questionType === "html-css-js" ||
    questionType === "react" ||
    questionType === "typescript" ||
    questionType === "nextjs" ||
    questionType === "mern";

  const entryCandidates = [
    "main.tsx",
    "index.tsx",
    "App.tsx",
    "app.tsx",
    "main.jsx",
    "index.jsx",
    "App.jsx",
    "app.jsx",
    "main.ts",
    "index.ts",
    "main.js",
    "index.js",
    "script.js",
  ];

  const fileNamesLower = Object.keys(files).map((name) => name.toLowerCase());
  const hasReactLikeEntry = entryCandidates.some((candidate) =>
    fileNamesLower.includes(candidate.toLowerCase()),
  );

  const previewContent = useMemo(() => {
    if (questionType === "html-css-js") {
      const html = files["index.html"] || "";
      const css = files["style.css"] || "";
      const js = files["script.js"] || "";

      // Create a complete HTML document
      const mergedHTML = html
        .replace(
          '<link rel="stylesheet" href="style.css">',
          `<style>${css}</style>`,
        )
        .replace('<script src="script.js"></script>', `<script>${js}</script>`);

      const hasTailwindCdn = /cdn\.tailwindcss\.com/i.test(mergedHTML);
      const fullHTML = hasTailwindCdn
        ? mergedHTML
        : mergedHTML.includes("</head>")
          ? mergedHTML.replace(
              "</head>",
              '<script src="https://cdn.tailwindcss.com"></script></head>',
            )
          : `<script src="https://cdn.tailwindcss.com"></script>${mergedHTML}`;

      return fullHTML;
    }

    if (
      questionType === "react" ||
      questionType === "nextjs" ||
      questionType === "typescript" ||
      questionType === "mern"
    ) {
      const fileMapJson = JSON.stringify(files).replace(
        /<\/script>/gi,
        "<\\/script>",
      );

      return String.raw`<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      html, body, #root { height: 100%; margin: 0; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const files = ${fileMapJson};
      const cssCandidates = ["style.css", "index.css", "app.css", "globals.css"];
      const cssText = cssCandidates.map((name) => files[name] || "").filter(Boolean).join("\n\n");
      if (cssText) {
        const style = document.createElement("style");
        style.textContent = cssText;
        document.head.appendChild(style);
      }

      const entryCandidates = [
        "main.tsx", "index.tsx", "App.tsx", "app.tsx", "main.jsx", "index.jsx", "App.jsx", "app.jsx",
        "main.ts", "index.ts", "main.js", "index.js", "script.js"
      ];
      const entryName = entryCandidates.find((name) => Boolean(files[name]));
      const jsLikeExt = [".tsx", ".ts", ".jsx", ".js"];

      const showError = (message, stack) => {
        const root = document.getElementById("root");
        root.innerHTML = "";
        const wrap = document.createElement("div");
        wrap.className = "p-4 text-sm";
        wrap.innerHTML = '<h2 style="color:#b91c1c;margin:0 0 8px 0;">Preview Error<\/h2>' +
          '<pre style="white-space:pre-wrap;background:#fee2e2;padding:10px;border-radius:6px;">' +
          String(message || "Unknown error") +
          (stack ? "\\n\\n" + String(stack) : "") +
          '<\/pre>';
        root.appendChild(wrap);
      };

      const normalizePath = (input) =>
        String(input || "")
          .replace(/\\\\/g, "/")
          .replace(/^\.\//, "")
          .replace(/\/+/g, "/");

      const dirname = (path) => {
        const normalized = normalizePath(path);
        const index = normalized.lastIndexOf("/");
        return index === -1 ? "" : normalized.slice(0, index);
      };

      const joinPath = (a, b) => normalizePath((a ? a + "/" : "") + b);

      const resolveImport = (from, specifier) => {
        const request = String(specifier || "");
        if (!request.startsWith(".")) {
          throw new Error("Only relative imports are supported in preview: " + request);
        }

        const baseDir = dirname(from);
        const basePath = normalizePath(joinPath(baseDir, request));
        const candidates = [
          basePath,
          ...jsLikeExt.map((ext) => basePath + ext),
          ...jsLikeExt.map((ext) => joinPath(basePath, "index" + ext)),
        ];

        const found = candidates.find((candidate) => files[candidate] !== undefined);
        if (!found) {
          throw new Error("Cannot resolve import '" + request + "' from '" + from + "'");
        }
        return found;
      };

      const moduleCache = {};
      const transpileCache = {};

      const transpileModule = (fileName) => {
        if (transpileCache[fileName]) return transpileCache[fileName];
        let source = String(files[fileName] || "");

        // CSS is injected separately into <style>, so remove CSS side-effect imports.
        source = source.replace(/import\s+["'][^"']+\.css["'];?/g, "");

        const transformed = Babel.transform(source, {
          presets: ["typescript", "react"],
          plugins: ["transform-modules-commonjs"],
          filename: fileName,
        }).code;

        transpileCache[fileName] = transformed;
        return transformed;
      };

      const requireModule = (request, from) => {
        const req = String(request || "");

        // Support common bare imports emitted by Babel from JSX/TSX modules.
        if (req === "react") {
          return window.React;
        }
        if (req === "react-dom") {
          return window.ReactDOM;
        }
        if (req === "react-dom/client") {
          return {
            createRoot: window.ReactDOM.createRoot,
          };
        }

        const resolved = from ? resolveImport(from, request) : normalizePath(request);

        if (moduleCache[resolved]) {
          return moduleCache[resolved].exports;
        }

        if (files[resolved] === undefined) {
          throw new Error("Module not found: " + resolved);
        }

        const module = { exports: {} };
        moduleCache[resolved] = module;
        const localRequire = (childRequest) => requireModule(childRequest, resolved);
        const compiled = transpileModule(resolved);
        const runner = new Function(
          "require",
          "module",
          "exports",
          "React",
          "ReactDOM",
          compiled,
        );

        runner(localRequire, module, module.exports, window.React, window.ReactDOM);
        return module.exports;
      };

      if (!entryName) {
        showError("No React entry file found. Add one of: main.tsx, index.tsx, App.tsx, main.jsx, index.jsx, App.jsx, main.ts, index.ts, main.js, index.js, script.js.");
      } else {
        try {
          const entryExports = requireModule(entryName);

          // If the entry file does not render by itself, try mounting default export.
          const root = document.getElementById("root");
          const DefaultComponent = entryExports && entryExports.default;
          if (root && root.childElementCount === 0 && typeof DefaultComponent === "function") {
            const createRoot = window.ReactDOM.createRoot;
            const rootInstance = createRoot(root);
            rootInstance.render(window.React.createElement(DefaultComponent));
          }
        } catch (error) {
          showError(error && error.message ? error.message : error, error && error.stack ? error.stack : "");
        }
      }
    </script>
  </body>
</html>`;
    }

    return "";
  }, [files, questionType]);

  const shouldRenderIframe =
    isIframePreviewType &&
    previewContent.trim().length > 0 &&
    (questionType === "html-css-js" || hasReactLikeEntry);

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
        {shouldRenderIframe ? (
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            title="Code Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-900">
            <div className="max-w-lg border-2 border-gray-800 bg-amber-50/70 dark:bg-amber-900/10 p-5 rounded-md">
              <img
                src={unsupportedImgSrc}
                alt="Preview not supported"
                width={220}
                height={220}
                className="mx-auto mb-4"
                onError={() => setUnsupportedImgSrc("/failure.png")}
              />
              <p className="text-xl font-game font-normal mb-3">
                Preview Not Supported Yet
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-comfortaa leading-relaxed">
                We highly encourage you to use your own code editor or open a
                new sandbox to see the code preview. Your code deserves a stage
                bigger than this tiny panel.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
