import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { AppShell } from "@/components/AppShell";
import { DataProviderProvider } from '../lib/hooks/useDataProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cexcie-demo.vercel.app"),
  title: {
    default: "CExCIE – Comparador de Carreras (Demo)",
    template: "%s · CExCIE",
  },
  description: "Demo interactiva de CExCIE: explora campus, facultades y carreras; compara hasta 3 opciones y revisa el detalle de cada carrera.",
  openGraph: {
    title: "CExCIE – Comparador de Carreras (Demo)",
    description:
      "Explora campus, facultades y carreras; compara hasta 3 opciones y revisa el detalle. Demo construida con Next.js.",
    url: "https://cexcie-demo.vercel.app",
    siteName: "CExCIE Demo",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "/detallecarrera.png",
        width: 1200,
        height: 630,
        alt: "CExCIE – Comparador de Carreras (Demo)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CExCIE – Comparador de Carreras (Demo)",
    description:
      "Explora campus, facultades y carreras; compara hasta 3 opciones y revisa el detalle.",
    images: ["/detallecarrera.png"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(() => {
  try {
    // Always use dark mode for CExCIE
    document.documentElement.setAttribute('data-theme', 'dark');
  } catch (_) {}
})();`,
        }}
      />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        <DataProviderProvider>
          <AppShell>{children}</AppShell>
        </DataProviderProvider>
      </body>
    </html>
  );
}
