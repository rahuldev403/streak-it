import React from "react";
import { Button, ButtonProps } from "./button";
import { LottieLoader } from "./lottie-loader";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    { className, children, loading = false, loadingText, disabled, ...props },
    ref
  ) => {
    return (
      <Button
        variant={"pixel"}
        className={cn(className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <LottieLoader size="sm" />
            {loadingText || children}
          </div>
        ) : (
          children
        )}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
