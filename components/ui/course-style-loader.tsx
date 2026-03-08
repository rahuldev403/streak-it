import React from "react";

interface CourseStyleLoaderProps {
  message?: string;
  className?: string;
  spinnerClassName?: string;
}

export function CourseStyleLoader({
  message = "Loading...",
  className = "py-12",
  spinnerClassName = "h-16 w-16",
}: CourseStyleLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-4 border-gray-900 dark:border-white mb-4 ${spinnerClassName}`}
      ></div>
      <p className="font-game font-normal text-xl">{message}</p>
    </div>
  );
}
