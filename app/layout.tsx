import type { Metadata } from "next";
import ReduxProvider from "@/components/providers/ReduxProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CortexAI — Autonomous Intelligence",
  description: "Editorial workspace for multi-modal intelligence, research, generation, and code synthesis.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#f5f5f5] text-[#0c0a09] antialiased selection:bg-[#f4c5a8]/50 selection:text-[#0c0a09]">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
