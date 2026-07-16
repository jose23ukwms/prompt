import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  // Verifikasi request ini benar dari Vercel Cron (opsional tapi disarankan)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Query ringan cukup untuk "membangunkan" Supabase
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
