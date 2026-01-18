import type { Metadata } from "next";
import "./globals.css";

import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "EventPlanner",
  description: "Universal Event Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
