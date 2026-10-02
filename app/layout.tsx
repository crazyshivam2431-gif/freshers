import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Departmental Fresher 2026",
  description: "Registration form for the Departmental Fresher 2026 celebration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
