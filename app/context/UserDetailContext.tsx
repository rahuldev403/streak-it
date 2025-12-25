import { createContext } from "react";

interface UserDetailContextType {
  userDetail: any;
  setUserDetail: (detail: any) => void;
}

export const UserDeatailContext = createContext<UserDetailContextType>({
  userDetail: undefined,
  setUserDetail: () => {},
});
