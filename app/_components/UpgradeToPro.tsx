"use client";

import { Button } from "@/components/ui/button";
import crown from "@/public/crown.png";
import checkmark from "@/public/crown.png"; // You can use a checkmark icon if available
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const UpgradeToPro = () => {
  const { user } = useUser();
  const hasPremiumAccess = user?.publicMetadata?.plan === "unlimited";

  if (hasPremiumAccess) {
    return (
      <div
        className="flex flex-col justify-center items-center border-4 border-black p-6 rounded-lg shadow-2xl bg-gradient-to-br from-green-400/30 to-emerald-500/30"
        style={{
          imageRendering: "pixelated",
          borderImage:
            "repeating-linear-gradient(90deg, #000 0, #000 4px, transparent 4px, transparent 8px) 4",
        }}
      >
        <Image src={crown} alt="Premium" width={50} height={50} />
        <h2 className="font-bold mt-4 font-comfortaa text-green-700 dark:text-green-300">
          Premium Member
        </h2>
        <h5 className="font-comfortaa font-bold text-center mb-2 text-green-600 dark:text-green-400">
          You have unlimited access to all courses! 🎉
        </h5>
        <Button
          variant={"pixel"}
          size="lg"
          className="font-game font-bold bg-green-500 hover:bg-green-600 border-green-700"
          disabled
        >
          Active Premium
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-center items-center border-4 border-black p-6  rounded-lg shadow-2xl bg-yellow-400/20"
      style={{
        imageRendering: "pixelated",
        borderImage:
          "repeating-linear-gradient(90deg, #000 0, #000 4px, transparent 4px, transparent 8px) 4",
      }}
    >
      <Image src={crown} alt="Crown" width={50} height={50} />
      <h2 className=" font-bold mt-4 font-comfortaa">Upgrade to Pro</h2>
      <h5 className="font-comfortaa font-bold text-center mb-2">
        join membership and get all course access
      </h5>
      <Link href="/pricing">
        <Button variant={"pixel"} size="lg" className="font-game font-bold">
          Upgrade Now
        </Button>
      </Link>
    </div>
  );
};

export default UpgradeToPro;
