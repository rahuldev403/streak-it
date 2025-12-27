"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import crown from "@/public/crown.png";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios from "axios";

const UpgradeToPro = () => {
  const { user, isLoaded } = useUser();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("/api/user/subscription");
        setHasPremiumAccess(response.data.hasPremium);
      } catch (error) {
        console.error("Failed to check subscription:", error);
        setHasPremiumAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user, isLoaded]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center border-4 border-black p-6 rounded-lg shadow-2xl bg-gray-100 dark:bg-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (hasPremiumAccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center border-4 border-black p-6 rounded-lg shadow-2xl bg-linear-to-br from-green-400/30 to-emerald-500/30"
        style={{
          imageRendering: "pixelated",
          borderImage:
            "repeating-linear-gradient(90deg, #000 0, #000 4px, transparent 4px, transparent 8px) 4",
        }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image src={crown} alt="Premium" width={50} height={50} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-bold mt-4 font-comfortaa text-green-700 dark:text-green-300"
        >
          Premium Member
        </motion.h2>
        <motion.h5
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="font-comfortaa font-bold text-center mb-2 text-green-600 dark:text-green-400 flex items-center gap-2"
        >
          You have unlimited access to all courses!
        </motion.h5>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            variant={"pixel"}
            size="lg"
            className="font-game font-normal font-bold bg-green-500 hover:bg-green-600 border-green-700"
            disabled
          >
            Active Premium
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col justify-center items-center border-4 border-black p-6  rounded-lg shadow-2xl bg-yellow-400/20"
      style={{
        imageRendering: "pixelated",
        borderImage:
          "repeating-linear-gradient(90deg, #000 0, #000 4px, transparent 4px, transparent 8px) 4",
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
      >
        <Image src={crown} alt="Crown" width={50} height={50} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className=" font-bold mt-4 font-comfortaa"
      >
        Upgrade to Pro
      </motion.h2>
      <motion.h5
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-comfortaa font-bold text-center mb-2"
      >
        join membership and get all course access
      </motion.h5>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link href="/pricing">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={"pixel"}
              size="lg"
              className="font-game font-normal font-bold"
            >
              Upgrade Now
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default UpgradeToPro;
