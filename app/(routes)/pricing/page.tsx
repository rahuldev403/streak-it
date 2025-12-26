"use client";

import { PricingTable } from "@clerk/nextjs";


const page = () => {
  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div 
        className="max-w-4xl w-full border-4 border-black rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-white dark:bg-gray-900 p-8"
        style={{
          imageRendering: "pixelated",
        }}
      >
        <div className="text-center mb-8">
          <h1 className="font-game font-normal text-4xl border-b-4 border-black dark:border-white pb-4 mb-4">
             Choose Your Plan
          </h1>
          <p className="font-comfortaa text-lg text-gray-700 dark:text-gray-300">
            Unlock unlimited access to all courses and chapters
          </p>
        </div>
        <div className="pixelated-pricing font-game font-normal">
          <PricingTable />
        </div>
      </div>
      <style jsx global>{`
        .pixelated-pricing button,
        .pixelated-pricing [role="button"] {
          border-radius: 0 !important;
          border: 4px solid #000 !important;
          box-shadow: 4px 4px 0 0 #000 !important;
          font-family: 'Press Start 2P', monospace !important;
          font-weight: bold !important;
          transition: all 0.1s ease !important;
          image-rendering: pixelated !important;
        }
        
        .pixelated-pricing button:hover,
        .pixelated-pricing [role="button"]:hover {
          transform: translate(2px, 2px) !important;
          box-shadow: 2px 2px 0 0 #000 !important;
        }
        
        .pixelated-pricing button:active,
        .pixelated-pricing [role="button"]:active {
          transform: translate(4px, 4px) !important;
          box-shadow: 0px 0px 0 0 #000 !important;
        }
      `}</style>
    </div>
  );
};

export default page;
