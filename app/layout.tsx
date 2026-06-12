import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GudangSafe",
  description: "Sistem Monitoring Gudang Toko Bumi Jaya",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}