import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tavus Interview Demo",
  description: "Client-side Tavus integration for hackathon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
