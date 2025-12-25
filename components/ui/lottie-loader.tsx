import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

interface LottieLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

const LottieLoader: React.FC<LottieLoaderProps> = React.memo(
  ({ className, size = "md", message }) => {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center transition-all duration-300 ease-in-out",
          className
        )}
      >
        <div
          className={cn(
            sizeClasses[size],
            "transition-transform duration-200 ease-in-out"
          )}
        >
          <DotLottieReact
            src="https://lottie.host/cc226d83-2558-41cc-94b6-f80b3a07589c/IWjU7telQH.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        {message && (
          <p className="mt-3 text-sm text-muted-foreground animate-pulse transition-opacity duration-200 ease-in-out">
            {message}
          </p>
        )}
      </div>
    );
  }
);

LottieLoader.displayName = "LottieLoader";

export { LottieLoader };
