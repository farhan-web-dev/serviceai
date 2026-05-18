import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Service Orchestrator",
  description: "Find and book informal service providers using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen pb-16`}>
        <Providers>
          <div className="max-w-md mx-auto bg-white min-h-screen shadow-md relative overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
