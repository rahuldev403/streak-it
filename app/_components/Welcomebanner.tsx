"use client";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Welcomebanner = () => {
  const { user } = useUser();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex gap-2 sm:gap-4 items-center w-full bg-linear-to-r from-blue-500/10 to-gray-700/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 lg:mb-8"
    >
      <motion.div
        initial={{ opacity: 0, rotate: -180 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        style={{ willChange: "transform" }}
      >
        <DotLottieReact
          src="https://lottie.host/b1ad6865-5e6e-4c24-93f0-878e4fc3af00/x6eu3O7MzW.lottie"
          loop
          autoplay
          className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 shrink-0"
          style={{ imageRendering: "crisp-edges" }}
        />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-game font-normal text-sm sm:text-lg md:text-2xl lg:text-3xl ml-1 sm:ml-3"
      >
        Yo, ready to level up DEV ? Welcome back,{" "}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-yellow-700 block sm:inline mt-1 sm:mt-0"
        >
          {user?.fullName}
        </motion.span>
      </motion.h2>
    </motion.div>
  );
};

export default Welcomebanner;
