"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const InviteFriend = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendInvite = async () => {
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/invite/send", { email });
      toast.success("Invitation sent successfully! 🎉");
      setEmail("");
    } catch (error: any) {
      console.error("Failed to send invite:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to send invitation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendInvite();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-6 sm:mt-8 p-3 sm:p-4"
    >
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-lg sm:text-xl md:text-2xl font-bold mb-2 font-comfortaa"
      >
        Invite Friend
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-comfortaa font-bold text-sm sm:text-base"
      >
        Having Fun? Share the love with a friend ! Enter an email we will send
        them the mail.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-2 mt-2"
      >
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="email"
          placeholder="Friend's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="border border-gray-700 w-full sm:w-[60%] md:w-[40%] lg:w-[30%] rounded-md p-2 font-comfortaa text-sm sm:text-base bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={"pixel"}
            onClick={handleSendInvite}
            disabled={loading}
            className=" bg-blue-500 text-white  rounded-md font-comfortaa font-bold hover:text-gray-600 text-sm sm:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default InviteFriend;
