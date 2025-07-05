import { ThemeProvider } from "@/components/providers/theme.provider";
import "./globals.css";

import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import QueryProvider from "@/components/providers/query.provider";
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from "@/components/providers/session.provider";

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-spaceGrotesk",
});

export const metadata: Metadata = {
  title: "Telegram web",
  description: "Telegram web application clone created by Sammi.ac",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <QueryProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${spaceGrotesk.variable} antialiased sidebar-custom-scrollbar min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white flex flex-col`}
            suppressHydrationWarning
          >
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
      </QueryProvider>
    </SessionProvider>
  );
}
