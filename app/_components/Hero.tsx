"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import herobg from "@/public/hero-bg.gif";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import bg from "@/public/bg.jpg";
import logo from "@/public/logo.jpeg";
import Image from "next/image";
const Hero = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="relative w-full h-screen">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${herobg.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-[90%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] max-w-4xl"
          >
            <div
              className="border-4 border-purple-600 bg-black/50 p-6 sm:p-8 md:p-10 lg:p-12 rounded-md"
              style={{ imageRendering: "pixelated" }}
            >
              <h2 className="font-normal text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-game text-white text-center mb-3">
                <span
                  className="text-purple-500 font-bold"
                  style={{ textShadow: "3px 3px 0 #000, -1px -1px 0 #000" }}
                >
                  Start{" "}
                </span>
                <span style={{ textShadow: "2px 2px #000, -2px -2px 0 #000" }}>
                  Your
                </span>
              </h2>
              <div className="flex flex-col items-center justify-center">
                <h2
                  className="font-normal text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-game text-yellow-400 text-center "
                  style={{
                    textShadow:
                      "3px 3px #000, -2px -2px 0 #000, -2px 2px 0 #000",
                  }}
                >
                  WEB DEV ADVENTURE WITH
                </h2>
                <Image
                  src={logo}
                  alt="Hero Decoration"
                  width={200}
                  className="md:h-12 h-20 mb-2 rounded-lg"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <p className="font-comfortaa text-xs sm:text-sm md:text-base text-gray-200 text-center mb-2 leading-relaxed">
                Beginner friendly courses and interactive projects
              </p>
              <p className="font-comfortaa text-xs sm:text-sm text-gray-300 text-center mb-6">
                Master web development from scratch with hands-on tutorials and
                real-world projects!
              </p>

              <div className="flex justify-center mb-6">
                {!user ? (
                  <SignInButton mode="modal" fallbackRedirectUrl="/">
                    <motion.div>
                      <Button
                        className="text-black font-game font-normal text-xs sm:text-sm rounded-md"
                        variant={"pixel"}
                      >
                        Get Started →
                      </Button>
                    </motion.div>
                  </SignInButton>
                ) : (
                  <Link href="/dashboard">
                    <div>
                      <Button
                        variant={"pixel"}
                        className="font-game font-normal text-black text-xs sm:text-sm rounded-md"
                      >
                        go to Dashboard →
                      </Button>
                    </div>
                  </Link>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 0.5,
                }}
                className="flex flex-col items-center gap-2"
              >
                <p className="text-gray-400 text-xs font-game">SCROLL DOWN</p>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-5 h-8 border-2 border-purple-500 rounded-full flex items-start justify-center p-1"
                >
                  <div className="w-1 h-1 bg-purple-500 rounded-full" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center justify-center">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-game font-normal text-white text-center "
              style={{ textShadow: "3px 3px 0 #000, -1px -1px 0 #000" }}
            >
              <span className="text-purple-500">EXPLORE</span> THE JOURNEY
            </h2>
            <p className="font-comfortaa text-sm sm:text-base text-gray-300 text-center max-w-2xl">
              Scroll to see our interactive learning experience in action
            </p>
          </div>
        }
      >
        <motion.img
          src={bg.src}
          alt="coding experience"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-center border-4 border-purple-600 "
          style={{ imageRendering: "pixelated" }}
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
};

export default Hero;
