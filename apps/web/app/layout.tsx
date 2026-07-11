import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ApiAuthProvider } from "@/provider/api-auth-provider";
import { QueryProvider } from "@/provider/query-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Big File",
  description: "Team chat with secure file sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <QueryProvider>
            <ApiAuthProvider>{children}</ApiAuthProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}