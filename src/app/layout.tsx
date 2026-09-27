import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brahma Module Tester",
  description: "NEET CBT Mock Exam Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF6F0] text-[#332720] antialiased">
        {children}
      </body>
    </html>
  );
}