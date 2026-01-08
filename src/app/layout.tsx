import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/presentation/providers/NextAuthProvider";
import { Header } from "@/presentation/components/Header";
import { Sidebar } from "@/presentation/components/Sidebar";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["200", "300", "400", "500", "600", "700", "800"]
});
const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-korean",
  weight: ["300", "400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Travel Diary",
  description: "Plan your trip and create beautiful memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${notoSansKR.variable} font-sans`}>
        <NextAuthProvider>
          <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-y-auto">
              <Header />
              <div className="p-3 md:p-10 mx-auto w-full flex-col gap-10">
                {children}
              </div>
            </main>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
