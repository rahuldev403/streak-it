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

interface ExploreCard {
  id: number;
  title: string;
  description: string;
  image: string;
}

const exploreCards: ExploreCard[] = [
  {
    id: 1,
    title: "Interactive Coding",
    description:
      "Learn by doing with hands-on coding exercises and real-time feedback",
    image: "/placeholder1.png",
  },
  {
    id: 2,
    title: "Project Based",
    description:
      "Build real-world projects while learning new concepts and technologies",
    image: "/placeholder2.png",
  },
  {
    id: 3,
    title: "Expert Guidance",
    description:
      "Get support from experienced developers and comprehensive tutorials",
    image: "/placeholder3.png",
  },
  {
    id: 4,
    title: "Track Progress",
    description:
      "Monitor your learning journey with detailed analytics and achievements",
    image: "/placeholder4.png",
  },
];

const ExploreMore = () => {
  return (
    <div className="w-full py-6 sm:py-8 md:py-12 px-2 sm:px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-game text-center mb-2 sm:mb-3 text-black dark:text-white">
          Explore More
        </h2>
        <p className="text-center text-gray-400 mb-4 sm:mb-6 md:mb-8 font-game text-xs sm:text-sm md:text-base">
          Discover what makes our platform special
        </p>

        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {exploreCards.map((card) => (
              <CarouselItem key={card.id}>
                <Card
                  className="bg-white dark:bg-gray-800 border-4 border-gray-800"
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
                          className="border-4 border-gray-800 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:gap-2 text-center sm:text-left">
                        <CardTitle className="font-game text-base sm:text-lg md:text-xl lg:text-2xl text-black dark:text-white">
                          {card.title}
                        </CardTitle>
                        <CardDescription className="font-game text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
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
