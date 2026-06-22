"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserType } from "@/features/auth/type";

interface AuthContextProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  resetUser: () => void;
  checkUser: () => Boolean;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  const [user, setUser] = useState({
    id: "",
    email: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkUser = () => {
    setIsLoggedIn(status === "authenticated" ? true : false);
    if (data?.user) {
      setUser({
        id: data.user.id as string,
        email: data.user.email as string,
      });
    }
    return status === "authenticated" ? true : false;
  };

  useEffect(() => {
    const a = checkUser();
    console.log(a, "aaaaaa");
  }, []);

  const resetUser = () => {
    setUser({
      id: "",
      email: "",
    });
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, resetUser, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
