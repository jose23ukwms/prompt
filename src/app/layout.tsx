import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Start Digital – AI Prompt Premium",
  description:
    "Ribuan Prompt AI Siap Pakai untuk Bisnis, Marketing, Coding, Desain, Produktivitas, dan Konten. Kompatibel dengan ChatGPT, Claude, Gemini, Grok, DeepSeek & lainnya.",
  keywords: [
    "prompt ai",
    "chatgpt prompt",
    "prompt marketing",
    "prompt coding",
    "prompt indonesia",
  ],
  openGraph: {
    title: "Start Digital – AI Prompt Premium",
    description:
      "Ribuan Prompt AI Siap Pakai untuk Bisnis, Marketing, Coding, Desain & Produktivitas.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/40">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-fuchsia-600/10 blur-[120px]" />
        </div>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
