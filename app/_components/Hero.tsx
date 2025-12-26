"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import bg from "@/public/bg.jpg";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const Hero = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center justify-center mt-1">
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-inter text-sm sm:text-base md:text-xl lg:text-2xl bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 bg-clip-text text-transparent hidden sm:block px-4 text-center"
        style={{
          textShadow: "1px 1px 0 #000, 2px 2px 0 #fff, 3px 3px 0 #000",
          fontFamily: "'Press Start 2P', 'Pixel', monospace",
          letterSpacing: "2px",
        }}
      >
        create the momentum you ever dreamed
      </motion.h3>
      <div className="w-full relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen overflow-hidden flex items-start justify-center pt-2 px-2 sm:px-4 md:px-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] h-[90%] sm:h-[85%] md:h-[80%] rounded-lg overflow-hidden shadow-2xl border-2 sm:border-4 border-gray-800"
          style={{ imageRendering: "pixelated" }}
        >
          <Image
            src={bg}
            alt="Background"
            width={1000}
            height={1000}
            className="w-full h-full object-cover opacity-[0.8]"
            style={{ imageRendering: "pixelated" }}
          />
        </motion.div>
        <div className="absolute w-full flex flex-col items-center justify-center h-full pointer-events-none px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-normal text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-game text-white z-10 text-center border-2 p-2 sm:p-3 md:p-4 rounded-md pointer-events-auto bg-black/50"
          >
            <span
              className="text-purple-500 font-bold "
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,1)" }}
            >
              Start{" "}
            </span>
            Your
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-game font-normal text-gray-400 z-10 text-center"
            style={{
              textShadow: "2px 2px #000,-2px -2px 0 #000 , -2px 2px 0 #000",
            }}
          >
            coding adventure
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-2 sm:mt-3 md:mt-5 font-game font-normal text-sm sm:text-lg md:text-2xl lg:text-3xl text-gray-300 text-center px-4"
          >
            Beginner friendly coding courses and projects
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {!user ? (
              <SignInButton mode="modal" fallbackRedirectUrl="/">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="text-black font-game font-normal rounded-md pt-2 sm:pt-3 mt-4 sm:mt-6 pointer-events-auto text-xs sm:text-sm md:text-base"
                    variant={"pixel"}
                  >
                    Get Started
                  </Button>
                </motion.div>
              </SignInButton>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="pointer-events-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={"pixel"}
                      className="rounded-md font-game font-normal text-black pt-2 sm:pt-3 mt-4 sm:mt-6 text-xs sm:text-sm md:text-base"
                    >
                      go to Dashboard
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
