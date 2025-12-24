"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const courses = [
  {
    id: 1,
    name: "Web Development Fundamentals",
    slug: "web-development-fundamentals",
    description:
      "Master HTML, CSS, and JavaScript basics to build modern websites",
  },
  {
    id: 2,
    name: "React & Next.js Mastery",
    slug: "react-nextjs-mastery",
    description:
      "Build powerful web applications with React and Next.js framework",
  },
  {
    id: 3,
    name: "Full-Stack Development",
    slug: "full-stack-development",
    description: "Learn backend APIs, databases, and deployment strategies",
  },
  {
    id: 4,
    name: "UI/UX Design Principles",
    slug: "ui-ux-design-principles",
    description: "Create beautiful user interfaces with modern design patterns",
  },
  {
    id: 5,
    name: "TypeScript Deep Dive",
    slug: "typescript-deep-dive",
    description: "Write type-safe code and scale applications with TypeScript",
  },
  {
    id: 6,
    name: "Database Design & SQL",
    slug: "database-design-sql",
    description: "Design efficient databases and master SQL query optimization",
  },
  {
    id: 7,
    name: "Cloud & DevOps Essentials",
    slug: "cloud-devops-essentials",
    description: "Deploy apps to cloud platforms with CI/CD pipelines",
  },
  {
    id: 8,
    name: "Mobile App Development",
    slug: "mobile-app-development",
    description: "Build cross-platform mobile apps with React Native",
  },
];

const Header_one = () => {
  const { user } = useUser();
  return (
    <div className="flex justify-between items-center px-8 py-4 border-b border-gray-800 b-shadow-md ">
      <h2 className="font-bold font-game bg-gradient-to-r from-[#af38cd] via-[#210125] to-[#8713e6] bg-clip-text text-transparent text-3xl">
        streak-setter
      </h2>
      <h3
        className="font-inter text-2xl bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 bg-clip-text text-transparent hidden md:block"
        style={{
          textShadow: "1px 1px 0 #000, 2px 2px 0 #fff, 3px 3px 0 #000",
          fontFamily: "'Press Start 2P', 'Pixel', monospace",
          letterSpacing: "2px",
        }}
      >
        create the momentum you ever dreamed
      </h3>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="pixel" className="font-game text-black rounded-md">
              Menu
              <span className="ml-2">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 8L10 13L15 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="font-game">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Link href="/courses">Courses</Link>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={8}
                className="bg-popover border-border shadow-lg w-[420px] max-h-[500px] overflow-y-auto p-2"
              >
                {courses.map((course) => (
                  <DropdownMenuItem key={course.id} asChild className="p-0">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex flex-col items-start gap-1 p-3 rounded-md hover:bg-accent transition-colors w-full"
                    >
                      <span className="font-game text-sm font-semibold text-foreground">
                        {course.name}
                      </span>
                      <span className="font-comfortaa text-xs text-muted-foreground leading-relaxed">
                        {course.description}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem asChild>
              <Link href="/links">Links</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/projects">Projects</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {!user ? (
          <SignInButton mode="modal" fallbackRedirectUrl="/">
            <Button
              className="text-black font-game rounded-md"
              variant={"pixel"}
            >
              Sign Up
            </Button>
          </SignInButton>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button
                variant={"pixel"}
                className="rounded-md text-black font-game"
              >
                Dashboard
              </Button>
            </Link>
            <UserButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header_one;
