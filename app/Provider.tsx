"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { UserDeatailContext } from "./context/UserDetailContext";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import Header_one from "./_components/Header_one";
interface ProviderProps {
  children: ReactNode;
  [key: string]: unknown;
}

const GlobalLoadingScreen = React.memo(() => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 dark:border-white mx-auto mb-4"></div>
        <p className="font-game font-normal text-xl">{loadingMessage || "Loading..."}</p>
      </div>
    </div>
  );
});
GlobalLoadingScreen.displayName = "GlobalLoadingScreen";

const ProviderContent = ({ children, ...props }: ProviderProps) => {
  const { user } = useUser();
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
        <Header_one />
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
