import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalMobileNav from "../components/ConditionalMobileNav";
import NetworkStatus from "../components/NetworkStatus";
import InstallPrompt from "../components/InstallPrompt";
import ThemeProviderWrapper from "../components/ThemeProviderWrapper";
import { ProfileProvider } from "./contexts/ProfileContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doy Pal",
  description: "A rewards tracking app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Doy Pal",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark:bg-black bg-white">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-200`}
      >
        <ThemeProviderWrapper>
          <ProfileProvider>
            <NetworkStatus />
            {/* <InstallPrompt /> */}
            {children}
            <ConditionalMobileNav />
          </ProfileProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
