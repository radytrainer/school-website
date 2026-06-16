"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type FirebaseUser,
} from "@/lib/firebase";
import type { SessionUser, UserRole, RolePermissions } from "@/types";
import { ROLE_PERMISSIONS } from "@/types";

interface AuthContextValue {
  user: SessionUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  permissions: RolePermissions | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (key: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithSupabase = useCallback(
    async (fbUser: FirebaseUser): Promise<SessionUser | null> => {
      const res = await fetch("/api/auth/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebase_uid: fbUser.uid }),
      });

      if (!res.ok) return null;
      const { user } = await res.json();
      if (!user) return null;

      const sessionUser = user as SessionUser;
      if (!sessionUser.is_active) throw new Error("Account is deactivated");

      return sessionUser;
    },
    []
  );

  const setSessionCookie = useCallback(async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      await fetch("/api/auth/session", { method: "DELETE" });
      return;
    }
    const idToken = await fbUser.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const sessionUser = await syncUserWithSupabase(fbUser);
          setUser(sessionUser);
          await setSessionCookie(fbUser);
        } catch {
          setUser(null);
          await signOut(auth);
        }
      } else {
        setUser(null);
        await setSessionCookie(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [syncUserWithSupabase, setSessionCookie]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const sessionUser = await syncUserWithSupabase(cred.user);
      if (!sessionUser) throw new Error("No account found in the system");
    },
    [syncUserWithSupabase]
  );

  const signInWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const sessionUser = await syncUserWithSupabase(cred.user);
    if (!sessionUser) throw new Error("No account found in the system");
  }, [syncUserWithSupabase]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const permissions = user ? ROLE_PERMISSIONS[user.role as UserRole] : null;

  const hasPermission = useCallback(
    (key: keyof RolePermissions): boolean => {
      return permissions?.[key] ?? false;
    },
    [permissions]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        permissions,
        signInWithEmail,
        signInWithGoogle,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
