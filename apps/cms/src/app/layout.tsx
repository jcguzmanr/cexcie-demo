import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Brand from "@/components/Brand";
import Header from "@/components/Header";
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
        <AuthProvider>
          <div className="min-h-screen flex bg-white text-neutral-900 dark:bg-black dark:text-neutral-100">
            <aside className="w-64 hidden sm:block p-4 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
              <div className="mb-4">
                <Brand size="md" showCms={true} />
              </div>
              <nav className="space-y-2">
                <div className="px-3 pt-2 pb-1 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">UC Data</div>
                <Link href="/" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="mr-2" aria-hidden>🏠</span>
                  Dashboard
                </Link>
                <Link href="/campus" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="mr-2" aria-hidden>🏫</span>
                  Campus
                </Link>
                <Link href="/facultades" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="mr-2" aria-hidden>🏛️</span>
                  Facultades
                </Link>
                <Link href="/carreras" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="mr-2" aria-hidden>🎓</span>
                  Carreras
                </Link>
                <Link href="/usuario" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="mr-2" aria-hidden>👤</span>
                  Usuario
                </Link>
                <a href="/api/health" target="_blank" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="mr-2" aria-hidden>🩺</span>
                  Health
                </a>

                <div className="mt-6 px-3 pt-2 pb-1 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">UC Leads</div>
                <Link href="/leads" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="mr-2" aria-hidden>🧲</span>
                  Leads
                </Link>

                <div className="mt-6 px-3 pt-2 pb-1 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">UC Telemetry</div>
                <Link href="/telemetry" className="block px-3 py-2 rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="mr-2" aria-hidden>📈</span>
                  Telemetry
                </Link>
              </nav>
            </aside>
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 bg-white dark:bg-black">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
