"use client";

import { SessionProvider } from "next-auth/react";
import { ReduxProvider } from "../../components/providers/redux-provider";
import { AuthProvider } from "../../components/providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider>
        <AuthProvider>{children}</AuthProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
