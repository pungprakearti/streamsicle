import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const creepster = localFont({
  src: "../fonts/Creepster-Regular.woff2",
  weight: "400",
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
