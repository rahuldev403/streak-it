"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard, Settings } from "lucide-react";
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
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { isAdmin } from "@/lib/admin";

interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
}

const Header_one = () => {
  const params = useParams();
  const pathname = usePathname();
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await axios.get("/api/courses/list");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Check if we're on a chapter page and extract chapter name
  const isChapterPage =
    pathname?.includes("/courses/") && params?.["chapter-name"];
  const chapterName = isChapterPage
    ? decodeURIComponent(params["chapter-name"] as string)
    : null;

  return (
    <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-800 b-shadow-md">
      <Link href="/" className="flex-shrink-0">
        <h2 className="font-bold font-game font-normal bg-gradient-to-r from-[#af38cd] via-[#210125] to-[#8713e6] bg-clip-text text-transparent text-xl sm:text-2xl lg:text-3xl">
          streak-setter
        </h2>
      </Link>

      {/* Chapter name in center - hide on small screens */}
      {chapterName && (
        <div className="hidden md:flex flex-1 text-center mx-4">
          <h3 className="font-game font-normal text-lg lg:text-xl text-gray-800 dark:text-gray-200 truncate">
            {chapterName}
          </h3>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="pixel"
              className="font-game font-normal text-black rounded-md text-xs sm:text-sm px-3 sm:px-4"
            >
              <span className="hidden sm:inline">Menu</span>
              <span className="sm:hidden">☰</span>
              <span className="ml-1 sm:ml-2 hidden sm:inline">
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
          <DropdownMenuContent className="font-game font-normal w-screen sm:w-auto max-w-[calc(100vw-2rem)]">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Link href="/courses">Courses</Link>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={8}
                className="bg-popover border-border shadow-lg w-[calc(100vw-2rem)] sm:w-[420px] max-h-[500px] overflow-y-auto p-2"
              >
                {loadingCourses ? (
                  <div className="p-4 text-center">
                    <span className="font-comfortaa text-sm text-muted-foreground">
                      Loading courses...
                    </span>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="p-4 text-center">
                    <span className="font-comfortaa text-sm text-muted-foreground">
                      No courses available
                    </span>
                  </div>
                ) : (
                  courses.map((course) => (
                    <DropdownMenuItem key={course.id} asChild className="p-0">
                      <Link
                        href={`/courses/${course.courseId}`}
                        className="flex flex-col items-start gap-1 p-3 rounded-md hover:bg-accent transition-colors w-full"
                      >
                        <span className="font-game font-normal text-sm font-semibold text-foreground">
                          {course.title}
                        </span>
                        <span className="font-comfortaa text-xs text-muted-foreground leading-relaxed">
                          {course.description}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem disabled>
              <div className="flex items-center justify-between w-full">
              <span>Problems</span>
              <span className="text-xs text-muted-foreground ml-2">Coming soon</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <div className="flex items-center justify-between w-full">
              <span>Notes</span>
              <span className="text-xs text-muted-foreground ml-2">Coming soon</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {!user ? (
          <SignInButton mode="modal" fallbackRedirectUrl="/">
            <Button
              className="text-black font-game font-normal rounded-md text-xs sm:text-sm px-3 sm:px-4"
              variant={"pixel"}
            >
              <span className="hidden sm:inline">Sign Up</span>
              <span className="sm:hidden">Join</span>
            </Button>
          </SignInButton>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard">
              <Button
                variant={"pixel"}
                className="rounded-md text-black font-game font-normal text-xs sm:text-sm px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Dashboard</span>
                <LayoutDashboard className="sm:hidden w-4 h-4" />
              </Button>
            </Link>
            {isAdmin(user?.primaryEmailAddress?.emailAddress) && (
              <Link href="/admin">
                <Button
                  variant={"pixel"}
                  className="rounded-md text-black font-game font-normal text-xs sm:text-sm px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">Admin</span>
                  <Settings className="sm:hidden w-4 h-4" />
                </Button>
              </Link>
            )}
            <UserButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header_one;
