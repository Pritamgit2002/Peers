"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useRef, type ReactNode } from "react";
import { useActiveUser, useCreateUser } from "@/hooks/api/users";
import { setAuthTokenGetter } from "@/lib/api";

export function ApiAuthProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const clerkUserId = user?.id ?? "";

  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: setActiveUser } = useActiveUser(clerkUserId);

  const wasSignedIn = useRef<boolean | null>(null);
  const activeClerkUserId = useRef<string | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const syncUserOnSignIn = async () => {
      if (!user) {
        return;
      }

      try {
        const response = await fetch(`/backend/api/users/${user.id}`);

        if (response.status === 404) {
          await createUser({
            name:
              user.fullName ?? user.username ?? user.firstName ?? "User",
            email: user.primaryEmailAddress?.emailAddress ?? "",
            clerkUserId: user.id,
            imageUrl: user.imageUrl,
            isActive: true,
          });
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to get user");
        }

        const data = await response.json();
        if (!data.user?.isActive) {
          await setActiveUser(user.id);
        }
      } catch (error) {
        console.error("Failed to sync user on sign-in:", error);
      }
    };

    if (isSignedIn && user) {
      activeClerkUserId.current = user.id;
      void syncUserOnSignIn();
    } else if (wasSignedIn.current && !isSignedIn && activeClerkUserId.current) {
      void setActiveUser(activeClerkUserId.current).catch((error) => {
        console.error("Failed to deactivate user on sign-out:", error);
      });
      activeClerkUserId.current = null;
    }

    wasSignedIn.current = isSignedIn ?? false;
  }, [isLoaded, isSignedIn, user, createUser, setActiveUser]);

  return children;
}
