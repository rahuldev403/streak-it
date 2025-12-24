"use client";
import { useUser } from "@clerk/nextjs";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Welcomebanner = () => {
  const { user } = useUser();
  return (
    <div className="flex gap-4 items-center w-full bg-gradient-to-r from-blue-500/10 to-gray-700/10 border border-blue-500/30 rounded-lg p-4 mb-8">
      <DotLottieReact
        src="https://lottie.host/b1ad6865-5e6e-4c24-93f0-878e4fc3af00/x6eu3O7MzW.lottie"
        loop
        autoplay
        className="w-20 h-20 shrink-0"
      />
      <h2 className="font-game text-3xl ml-3">
        Welcome to the Dashboard{" "}
        <span className="text-yellow-700">{user?.fullName}</span>
      </h2>
    </div>
  );
};

export default Welcomebanner;
