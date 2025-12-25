"use client";
import { useUser } from "@clerk/nextjs";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Welcomebanner = () => {
  const { user } = useUser();
  return (
    <div className="flex gap-2 sm:gap-4 items-center w-full bg-gradient-to-r from-blue-500/10 to-gray-700/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 lg:mb-8">
      <DotLottieReact
        src="https://lottie.host/b1ad6865-5e6e-4c24-93f0-878e4fc3af00/x6eu3O7MzW.lottie"
        loop
        autoplay
        className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 shrink-0"
      />
      <h2 className="font-game text-sm sm:text-lg md:text-2xl lg:text-3xl ml-1 sm:ml-3">
        Welcome to the Dashboard{" "}
        <span className="text-yellow-700 block sm:inline mt-1 sm:mt-0">
          {user?.fullName}
        </span>
      </h2>
    </div>
  );
};

export default Welcomebanner;
