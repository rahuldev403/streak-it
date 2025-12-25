import { Button } from "@/components/ui/button";
import React from "react";

const InviteFriend = () => {
  return (
    <div className="mt-6 sm:mt-8 p-3 sm:p-4">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 font-comfortaa">
        Invite Friend
      </h2>
      <p className="font-comfortaa font-bold text-sm sm:text-base">
        Having Fun? Share the love with a friend ! Enter an email we will send
        them the mail.
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-2 mt-2">
        <input
          type="email"
          placeholder="Friend's email"
          className="border border-gray-700 w-full sm:w-[60%] md:w-[40%] lg:w-[30%] rounded-md p-2 font-comfortaa text-sm sm:text-base dark:bg-gray-800 dark:text-white"
        />
        <Button
          variant={"pixel"}
          className=" bg-blue-500 text-white  rounded-md font-comfortaa font-bold hover:text-gray-600 text-sm sm:text-base w-full sm:w-auto"
        >
          Send Invite
        </Button>
      </div>
    </div>
  );
};

export default InviteFriend;
