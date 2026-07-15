"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FreeTrialGate from "@/components/FreeTrialGate";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Area admin: tanpa navbar/footer publik supaya pengunjung tidak melihat jejaknya.
    return <>{children}</>;
  }

  return (
    <FreeTrialGate>
      <Navbar />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </FreeTrialGate>
  );
}
