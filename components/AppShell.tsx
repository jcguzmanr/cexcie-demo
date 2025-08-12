"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Progress } from "@/components/Progress";
import { createIngestGlobal } from "@/lib/ingest";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    createIngestGlobal();
  }, []);
  return (
    <div className="mx-auto max-w-[1024px] min-h-screen flex flex-col p-safe">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <Progress currentPath={pathname ?? "/"} />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

