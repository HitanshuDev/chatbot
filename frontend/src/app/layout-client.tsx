'use client';

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return <>{children}</>;
}
