import React from "react";
import { LottieLoader } from "./lottie-loader";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  className?: string;
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  className,
  message = "Loading...",
  fullScreen = false,
  size = "lg",
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-200 ease-in-out">
        <LottieLoader size={size} message={message} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center p-8 min-h-[200px] transition-all duration-200 ease-in-out",
        className
      )}
    >
      <LottieLoader size={size} message={message} />
    </div>
  );
};

export { LoadingScreen };
