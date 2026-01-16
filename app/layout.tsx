import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seasonal Sous Chef",
  description: "Find seasonal produce in your area",
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
