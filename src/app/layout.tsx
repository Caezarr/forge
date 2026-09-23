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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FORGE",
    description:
      "Local-first daily discipline protocol for quests, clean living, progression, and Apple Focus setup.",
    url: "https://forge-app.vercel.app",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      ratingCount: "1",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0b1113]">{children}</body>
    </html>
  );
}
