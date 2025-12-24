import Image from "next/image";
import bg from "@/public/bg.jpg";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="w-full relative h-screen overflow-hidden flex items-start justify-center pt-12 px-8">
      <div
        className="relative w-[80%] h-[80%] rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800"
        style={{ imageRendering: "pixelated" }}
      >
        <Image
          src={bg}
          alt="Background"
          width={1000}
          height={1000}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div className="absolute w-full flex flex-col items-center justify-center h-full pointer-events-none">
        <h2 className="font-bold text-7xl font-game text-white z-10">
          <span className="text-purple-500">Start </span>Your
        </h2>
        <h2
          className="font-bold text-7xl font-game text-gray-400 z-10"
          style={{
            textShadow: "2px 2px #000,-2px -2px 0 #000 , -2px 2px 0 #000",
          }}
        >
          coding adventure
        </h2>
        <h2 className="m-t-5 font-game text-3xl text-gray-300">
          Beginner friendly coidng courses and projects
        </h2>
        <Button
          variant={"pixel"}
          className="rounded-md mt-5 font-game text-bold pointer-events-auto"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Hero;
