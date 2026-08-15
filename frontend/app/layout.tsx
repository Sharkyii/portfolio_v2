import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { CommandPalette } from "@/components/command/CommandPalette";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import "./globals.css";

// Deliberately not Geist — it's the default create-next-app ships with, and
// at this point that makes it the single most common typeface in this exact
// dark-portfolio aesthetic. Space Grotesk reads distinctive at both display
// and body sizes, so one family covers everything except code.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sneh Kansagara",
  description: "AI/ML engineer — ask the chatbot anything about my projects, or book a meeting.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        {children}
        <Footer />
        <CommandPalette />
      </body>
    </html>
  );
}
