import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jangki - Korean Chess",
  description: "Online multiplayer Korean chess (Janggi) for 2 players",
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
