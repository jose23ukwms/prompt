import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  const promptId = Number(body.promptId);
  if (!promptId) {
    return NextResponse.json({ ok: false, reason: "INVALID_PROMPT" }, { status: 400 });
  }

  const [prompt] = await db
    .select({ id: prompts.id, content: prompts.content, isPremium: prompts.isPremium })
    .from(prompts)
    .where(eq(prompts.id, promptId))
    .limit(1);
  if (!prompt) {
    return NextResponse.json({ ok: false, reason: "NOT_FOUND" }, { status: 404 });
  }

  const email = typeof body.profileEmail === "string" ? body.profileEmail : null;
  const profile = await findProfileByEmail(email);
  const unlimited = hasUnlimitedAccess(profile);

  if (unlimited) {
    return NextResponse.json({
      ok: true,
      allowed: true,
      content: prompt.content,
      isPremiumUser: true,
      planSlug: profile?.planSlug,
      trial: null,
    });
  }

  if (prompt.isPremium) {
    return NextResponse.json({
      ok: true,
      allowed: false,
      reason: profile?.status === "pending" ? "PAYMENT_PENDING" : "PREMIUM_REQUIRED",
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
  const trialInfo = trialPayload(trial);
  const response = NextResponse.json(
    trial.expired
      ? { ok: true, allowed: false, reason: "TRIAL_EXPIRED", trial: trialInfo }
      : {
          ok: true,
          allowed: true,
          content: prompt.content,
          isPremiumUser: false,
          planSlug: profile?.planSlug ?? "free",
          trial: trialInfo,
        }
  );

  if (isNewCookie) {
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
