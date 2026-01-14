import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Nerón Inventory - Sistema de Tracking de Honorarios",
  description: "Sistema para el seguimiento de honorarios de clientes y empleados",
};

import { Navbar } from "@/components/Navbar";
import { GeminiChat } from "@/components/GeminiChat";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Navbar />
        {children}
        <GeminiChat />
      </body>
    </html>
  );
}
