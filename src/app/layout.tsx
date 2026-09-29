import type { Metadata } from "next";
import { Creepster } from "next/font/google";
import "./globals.css";

const creepster = Creepster({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-creepster",
});

export const metadata: Metadata = {
  title: "Streamsicle",
  description: "Your family streaming ledger",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${creepster.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
