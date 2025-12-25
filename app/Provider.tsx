"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { UserDeatailContext } from "./context/UserDetailContext";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import Header_one from "./_components/Header_one";
import { LoadingScreen } from "@/components/ui/loading-screen";
interface ProviderProps {
  children: ReactNode;
  [key: string]: unknown;
}

const GlobalLoadingScreen = React.memo(() => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return <LoadingScreen fullScreen message={loadingMessage} size="xl" />;
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
