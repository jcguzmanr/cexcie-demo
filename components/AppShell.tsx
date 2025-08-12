"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Progress } from "@/components/Progress";
import { createIngestGlobal } from "@/lib/ingest";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    createIngestGlobal();
  }, []);
  return (
    <div className="mx-auto max-w-[1024px] min-h-screen flex flex-col p-safe">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="max-w-[1024px] mx-auto flex items-center justify-between gap-3 px-4 py-2">
          <Progress currentPath={pathname ?? "/"} />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

