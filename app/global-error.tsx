"use client";
import React from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="p-6 grid gap-4">
          <h1 className="text-xl font-semibold">Error global</h1>
          <pre className="text-sm opacity-80 whitespace-pre-wrap">{error?.message}</pre>
          <button className="rounded-md bg-[var(--uc-purple)] text-white px-4 py-2 w-fit" onClick={() => reset()}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}


