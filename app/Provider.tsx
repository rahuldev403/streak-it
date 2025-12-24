"use client";
import { useUser } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { UserDeatailContext } from "./context/UserDetailContext";
interface ProviderProps {
  children: ReactNode;
  [key: string]: unknown;
}

const Provider = ({ children, ...props }: ProviderProps) => {
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
        {children}
      </UserDeatailContext.Provider>
    </NextThemesProvider>
  );
};

export default Provider;
