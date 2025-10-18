"use client";
import React from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full theme-dark">
      <body className={`${inter.variable} ${mono.variable} antialiased h-full bg-background text-foreground`}>
        <div className="min-h-full flex flex-col" role="application">
          {children}
        </div>
      </body>
    </html>
  );
}
