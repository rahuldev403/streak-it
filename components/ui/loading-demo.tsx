import React from "react";
import { LottieLoader } from "./lottie-loader";
import { LoadingScreen } from "./loading-screen";
import { Button } from "./button";
import { useLoadingManager } from "@/hooks/use-loading-manager";

const LoadingDemo = () => {
  const { startLoading, stopLoading, withLoading } = useLoadingManager();

  const simulateApiCall = () => {
    return new Promise((resolve) => setTimeout(resolve, 3000));
  };

  const handleManualLoading = () => {
    startLoading("Processing your request...");
    setTimeout(() => {
      stopLoading();
    }, 3000);
  };

  const handleWithLoading = async () => {
    await withLoading(simulateApiCall, "Fetching data...");
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Loading Animation Examples</h1>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Different Sizes</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm mb-2">Small</p>
            <LottieLoader size="sm" />
          </div>
          <div>
            <p className="text-sm mb-2">Medium</p>
            <LottieLoader size="md" />
          </div>
          <div>
            <p className="text-sm mb-2">Large</p>
            <LottieLoader size="lg" />
          </div>
          <div>
            <p className="text-sm mb-2">Extra Large</p>
            <LottieLoader size="xl" />
          </div>
        </div>
      </div>

      {/* With Messages */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">With Loading Messages</h2>
        <div className="grid grid-cols-2 gap-4">
          <LoadingScreen
            message="Loading courses..."
            size="md"
            className="border rounded-lg"
          />
          <LoadingScreen
            message="Saving progress..."
            size="md"
            className="border rounded-lg"
          />
        </div>
      </div>

      {/* Interactive Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Global Loading Examples</h2>
        <div className="flex gap-4">
          <Button onClick={handleManualLoading}>Start Manual Loading</Button>
          <Button onClick={handleWithLoading}>Use withLoading Hook</Button>
        </div>
      </div>
    </div>
  );
};

export { LoadingDemo };
