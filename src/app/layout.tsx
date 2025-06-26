import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "./Registry"; 
import { QueryProvider } from "@/providers/QueryProvider";
import { ReduxProvider } from "../providers/ReduxProvider";
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
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.png",
  },
  description: "Pre Registration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <LocaleProvider>
            <QueryProvider> 
              <StyledComponentsRegistry>
                <main>{children}</main>
              </StyledComponentsRegistry>
            </QueryProvider> 
          </LocaleProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
