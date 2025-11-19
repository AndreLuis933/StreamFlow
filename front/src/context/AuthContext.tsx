import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/services/firebase-config";

type AuthContextType = {
  currentUser: User | null;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa estar dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return user;
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
