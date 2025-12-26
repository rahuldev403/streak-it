"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import react from "@/public/react.jpg";
import nextjs from "@/public/next.png";
import mern from "@/public/mern.jpg";
import mentor from "@/public/mentor.jpg";
import community from "@/public/community.jpg";
import contests from "@/public/contest.jpg";
import { StaticImageData } from "next/image";

interface ExploreCard {
  id: number;
  title: string;
  description: string;
  image: string | StaticImageData;
}

const exploreCards: ExploreCard[] = [
  {
    id: 1,
    title: "React Practice",
    description:
      "Master React with hands-on exercises and real-world component building",
    image: react,
  },
  {
    id: 2,
    title: "Next.js Projects",
    description:
      "Build modern web applications with Next.js through practical projects",
    image: nextjs,
  },
  {
    id: 3,
    title: "Full MERN Stack Practice",
    description:
      "Complete full-stack development with MongoDB, Express, React, and Node.js",
    image: mern,
  },
  {
    id: 4,
    title: "Mentorship Program",
    description:
      "Get personalized guidance from experienced developers to accelerate your growth",
    image: mentor,
  },
  {
    id: 5,
    title: "Developer Community",
    description:
      "Connect with fellow learners, share knowledge, and collaborate on projects",
    image: community,
  },
  {
    id: 6,
    title: "Coding Contests",
    description:
      "Challenge yourself with weekly coding competitions and win exciting prizes",
    image: contests,
  },
];

const ExploreMore = () => {
  return (
    <div className="w-full py-6 sm:py-8 md:py-12 px-2 sm:px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-game font-normal text-center mb-2 sm:mb-3 text-black dark:text-white">
          Coming Soon
        </h2>
        <p className="text-center text-gray-400 mb-4 sm:mb-6 md:mb-8 font-game font-normal text-xs sm:text-sm md:text-base">
          Exciting new features and learning opportunities on the horizon
        </p>

        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {exploreCards.map((card) => (
              <CarouselItem key={card.id}>
                <Card
                  className="bg-white dark:bg-gray-800 border-4 border-gray-800 rounded-full px-4 "
                  style={{ imageRendering: "pixelated" }}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr] gap-3 sm:gap-4 md:gap-6 items-center">
                      <div className="shrink-0">
                        <Image
                          src={card.image}
                          alt={card.title}
                          width={120}
                          height={120}
                          className="border-4 border-transparentw-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-md object-cover"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:gap-2 text-center sm:text-left">
                        <CardTitle className="font-game font-normal text-base sm:text-lg md:text-xl lg:text-2xl text-black dark:text-white">
                          {card.title}
                        </CardTitle>
                        <CardDescription className="font-game font-normal text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
                          {card.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious variant="pixel" className="hidden sm:flex" />
          <CarouselNext variant="pixel" className="hidden sm:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default ExploreMore;
