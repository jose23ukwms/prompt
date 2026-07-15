import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  DEVICE_COOKIE,
  ensureDeviceTrial,
  findProfileByEmail,
  hasUnlimitedAccess,
  trialPayload,
} from "@/lib/access-control";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.profileEmail === "string" ? body.profileEmail : null;
  const profile = await findProfileByEmail(email);

  if (hasUnlimitedAccess(profile)) {
    return NextResponse.json({
      ok: true,
      unlimited: true,
      isPremium: true,
      role: profile?.role,
      planSlug: profile?.planSlug,
      trial: null,
    });
  }

  const cookieStore = await cookies();
  let deviceId = cookieStore.get(DEVICE_COOKIE)?.value;
  let isNewCookie = false;
  if (!deviceId) {
    deviceId = crypto.randomUUID().replaceAll("-", "");
    isNewCookie = true;
  }

  const trial = await ensureDeviceTrial(deviceId);
  const response = NextResponse.json({
    ok: true,
    unlimited: false,
    isPremium: false,
    role: profile?.role ?? "anonymous",
    planSlug: profile?.planSlug ?? "free",
    trial: trialPayload(trial),
  });

  if (isNewCookie) {
    // Cookie dipertahankan 1 tahun agar masa trial tidak otomatis reset setelah hari ke-7.
    response.cookies.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  }

  return response;
}
