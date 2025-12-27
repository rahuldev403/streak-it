import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Comfortaa,
  Fira_Code,
  Jersey_10,
} from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import favicon from "@/public/fire.png";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "streak-it - Learn. Code. Repeat.",
  description:
    "Interactive coding courses with a retro 8-bit twist. Learn web development through hands-on projects and pixel-perfect code.",
  icons: {
    icon: `${favicon.src}`,
  },
  metadataBase: new URL("https://streak-it.vercel.app/"),
};

// const GameFont = Rubik_Gemstones({
//   subsets: ["latin"],
//   variable: "--font-game",
//   weight: "400",
// });
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: "400",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  weight: "400",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  weight: ["300", "400", "500", "600", "700"],
});

const GameFont = Jersey_10({
  subsets: ["latin"],
  variable: "--font-game",
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className="bg-background"
        data-theme="dark"
        style={{ colorScheme: "dark" }}
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${GameFont.variable} ${inter.variable} ${comfortaa.variable} ${firaCode.variable} antialiased`}
        >
          <Provider>{children}</Provider>
          <Toaster
            position="top-right"
            richColors
            expand={true}
            duration={4000}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
