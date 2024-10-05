"use client";

import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { api } from "@packages/backend/convex/_generated/api";
import { ConvexReactClient, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode, useEffect } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <UserInitializer>{children}</UserInitializer>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

function UserInitializer({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  useEffect(() => {
    if (user) {
      createOrUpdateUser({ name: user.fullName || "", email: user.primaryEmailAddress?.emailAddress || "" });
    }
  }, [user, createOrUpdateUser]);

  return <>{children}</>;
}