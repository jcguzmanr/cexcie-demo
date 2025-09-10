import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CExCIE CMS",
  description: "Panel de administración CExCIE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex bg-white text-neutral-900 dark:bg-black dark:text-neutral-100">
          <aside className="w-64 hidden sm:block p-4 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
            <div className="text-lg font-semibold mb-4">CExCIE CMS</div>
            <nav className="space-y-2">
              <a href="/" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">Dashboard</a>
              <a href="/facultades" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">Facultades</a>
              <a href="/campus" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">Campus</a>
              <a href="/carreras" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">Carreras</a>
              <a href="/api/health" target="_blank" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">Health</a>
            </nav>
          </aside>
          <main className="flex-1 bg-white dark:bg-black">{children}</main>
        </div>
      </body>
    </html>
  );
}
