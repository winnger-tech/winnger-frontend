import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
// This path is correct as long as Registry.tsx is in the same `app` folder.
import StyledComponentsRegistry from "./Registry"; 
import { QueryProvider } from "@/providers/QueryProvider";
import LanguageSelector from "./component/LanguageSelector";
import { LocaleProvider } from "../utils/LocaleContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "winngur",
  description: "Pre Registration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LocaleProvider>
          <QueryProvider> 
            <div className="min-h-screen">
              <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
                  <LanguageSelector />
                </div>
              </header>
              <main>
                <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
              </main>
            </div>
          </QueryProvider> 
        </LocaleProvider>
      </body>
    </html>
  );
}
