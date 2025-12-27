"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";

const Description = () => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 p-4 md:p-6 mb-6 max-w-7xl w-full"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 "
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-5xl font-game font-normal mt-2 mb-4 text-purple-600"
            style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000" }}
          >
            Code Like a Pro
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-comfortaa font-normal leading-relaxed">
            Master Web Development with hands-on projects and real-world
            challenges. From beginner basics to advanced techniques, level up
            your skills one line of code at a time. Join thousands of developers
            building their future through interactive learning.
          </p>
        </motion.div>

        <motion.div
          id="webm"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex-1 max-w-lg"
        >
          <div
            className="w-full h-auto rounded-lg  shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ imageRendering: "pixelated" }}
          >
            <DotLottieReact
              src="https://lottie.host/20bd2691-8d05-474a-a52a-ce414a4ab734/lvnKjDZYpb.lottie"
              loop
              autoplay
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Description;
