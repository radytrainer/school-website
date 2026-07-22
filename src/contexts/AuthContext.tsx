"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  updatePassword,
  type FirebaseUser,
} from "@/lib/firebase";
import type { SessionUser, UserRole, RolePermissions } from "@/types";
import { ROLE_PERMISSIONS } from "@/types";

interface AuthContextValue {
  user: SessionUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  permissions: RolePermissions | null;
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (key: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Creates the session cookie AND returns the Supabase user in one call.
  // The server endpoint uses the service-role key so it bypasses RLS.
  const setSessionCookie = useCallback(
    async (fbUser: FirebaseUser | null): Promise<SessionUser | null> => {
      if (!fbUser) {
        await fetch("/api/auth/session", { method: "DELETE" });
        return null;
      }
      const idToken = await fbUser.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, firebase_uid: fbUser.uid }),
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

  // Tracks Firebase UIDs already resolved by signInWithEmail/signInWithGoogle so
  // the onAuthStateChanged listener below (which exists for page-load/refresh
  // persistence) doesn't redundantly re-validate and doesn't race with it.
  const [resolvedUid, setResolvedUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser && fbUser.uid === resolvedUid) {
        // Already validated by signInWithEmail/signInWithGoogle below.
        setLoading(false);
        return;
      }

      if (fbUser) {
        try {
          const sessionUser = await setSessionCookie(fbUser);
          if (!sessionUser) throw new Error("No account found in the system");
          setUser(sessionUser);
        } catch (err) {
          console.error("Session validation failed:", err);
          setUser(null);
          await signOut(auth);
        }
      } else {
        setUser(null);
        setResolvedUid(null);
        await setSessionCookie(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [setSessionCookie, resolvedUid]);

  // Performs the full sign-in flow synchronously (Firebase auth + admin_users
  // lookup) so a failed lookup throws here and the caller can show a real
  // error, instead of failing silently inside the onAuthStateChanged listener.
  const signInWithEmail = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      try {
        const sessionUser = await setSessionCookie(credential.user);
        if (!sessionUser) throw new Error("No account found in the system");
        setUser(sessionUser);
        setFirebaseUser(credential.user);
        setResolvedUid(credential.user.uid);
      } catch (err) {
        await signOut(auth);
        throw err;
      }
    },
    [setSessionCookie]
  );

  const signInWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    try {
      const sessionUser = await setSessionCookie(credential.user);
      if (!sessionUser) throw new Error("No account found in the system");
      setUser(sessionUser);
      setFirebaseUser(credential.user);
      setResolvedUid(credential.user.uid);
    } catch (err) {
      await signOut(auth);
      throw err;
    }
  }, [setSessionCookie]);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const changePassword = useCallback(
    async (newPassword: string) => {
      if (!auth.currentUser) throw new Error("Not signed in");
      await updatePassword(auth.currentUser, newPassword);
    },
    []
  );

  // Clears the session cookie first so the middleware's cookie check no
  // longer sees an active session by the time `user` flips to null and
  // triggers a redirect to /auth/login — otherwise the redirect can race
  // the cookie deletion and the middleware bounces the user right back
  // into /admin (it treats the stale cookie as still authenticated).
  const logout = useCallback(async () => {
    await signOut(auth);
    await setSessionCookie(null);
    setResolvedUid(null);
    setUser(null);
    setFirebaseUser(null);
    // Navigate here (instead of only relying on a layout effect reacting to
    // `user` flipping to null) so the redirect fires immediately as part of
    // this action rather than waiting on a separate render/effect round trip.
    router.push(`/${locale}/auth/login`);
  }, [setSessionCookie, router, locale]);

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
        resetPassword,
        changePassword,
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
