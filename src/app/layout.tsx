import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://forge-app.vercel.app"),
  title: {
    default: "FORGE - Daily Protocol",
    template: "%s - FORGE",
  },
  description:
    "Local-first daily discipline protocol for quests, clean living, progression, and Apple Focus setup.",
  applicationName: "FORGE",
  manifest: "/manifest.json",
  category: "productivity",
  keywords: [
    "discipline",
    "habit tracker",
    "daily protocol",
    "bodyweight",
    "deep work",
    "local-first",
    "PWA",
  ],
  authors: [{ name: "FORGE" }],
  creator: "FORGE",
  openGraph: {
    title: "FORGE - Daily Protocol",
    description:
      "A local-first protocol for the day you said you would live.",
    type: "website",
    siteName: "FORGE",
  },
  twitter: {
    card: "summary",
    title: "FORGE - Daily Protocol",
    description:
      "A local-first protocol for daily quests, clean living, progression, and Apple Focus setup.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FORGE",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1113" },
    { media: "(prefers-color-scheme: light)", color: "#0b1113" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b1113]">{children}</body>
    </html>
  );
}
