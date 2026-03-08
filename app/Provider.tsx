"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { UserDeatailContext } from "./context/UserDetailContext";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import Header_one from "./_components/Header_one";
import { CourseStyleLoader } from "@/components/ui/course-style-loader";
interface ProviderProps {
  children: ReactNode;
  [key: string]: unknown;
}

const GlobalLoadingScreen = React.memo(() => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <CourseStyleLoader
        message={loadingMessage || "Loading..."}
        className="py-0"
      />
    </div>
  );
});
GlobalLoadingScreen.displayName = "GlobalLoadingScreen";

const ProviderContent = ({ children, ...props }: ProviderProps) => {
  const { user } = useUser();
  const pathname = usePathname();
  const [userDetail, setUserDetail] = useState<any>(null);
  const createNewUser = async () => {
    const result = await axios.post("/api/user", {});
    console.log(result);
    setUserDetail(result?.data);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        try {
          await createNewUser();
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchUser();
  }, [user]);

  return (
    <NextThemesProvider {...props}>
      <UserDeatailContext.Provider value={{ userDetail, setUserDetail }}>
        <GlobalLoadingScreen />
        {pathname !== "/" && pathname !== "/interview-prep/dsa" && (
          <Header_one />
        )}
        {children}
      </UserDeatailContext.Provider>
    </NextThemesProvider>
  );
};

const Provider = ({ children, ...props }: ProviderProps) => {
  return (
    <LoadingProvider>
      <ProviderContent {...props}>{children}</ProviderContent>
    </LoadingProvider>
  );
};

export default Provider;
