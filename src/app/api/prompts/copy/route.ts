import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { prompts, promptCopies } from "@/db/schema";
import { and, eq } from "drizzle-orm";
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
  if (!promptId) return NextResponse.json({ ok: false }, { status: 400 });

  const [prompt] = await db
    .select({ isPremium: prompts.isPremium })
    .from(prompts)
    .where(eq(prompts.id, promptId))
    .limit(1);
  if (!prompt) return NextResponse.json({ ok: false }, { status: 404 });

  const profile = await findProfileByEmail(
    typeof body.profileEmail === "string" ? body.profileEmail : null
  );
  const unlimited = hasUnlimitedAccess(profile);
  if (unlimited) {
    return NextResponse.json({
      ok: true,
      isPremiumPrompt: prompt.isPremium,
      canCopy: true,
      remaining: "unlimited",
      isPremiumUser: true,
      isAdmin: profile?.role === "admin" || profile?.role === "superadmin",
      reason: null,
    });
  }

  if (prompt.isPremium) {
    return NextResponse.json({
      ok: true,
      isPremiumPrompt: true,
      canCopy: false,
      remaining: 0,
      isPremiumUser: false,
      isAdmin: false,
      reason: "PREMIUM_REQUIRED",
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

  let alreadyCopied = false;
  if (profile?.id) {
    const [row] = await db
      .select({ id: promptCopies.id })
      .from(promptCopies)
      .where(and(eq(promptCopies.promptId, promptId), eq(promptCopies.profileId, profile.id)))
      .limit(1);
    alreadyCopied = Boolean(row);
  }
  if (!alreadyCopied) {
    const [row] = await db
      .select({ id: promptCopies.id })
      .from(promptCopies)
      .where(and(eq(promptCopies.promptId, promptId), eq(promptCopies.clientId, deviceId)))
      .limit(1);
    alreadyCopied = Boolean(row);
  }

  const canCopy = !trial.expired && !alreadyCopied;
  const response = NextResponse.json({
    ok: true,
    isPremiumPrompt: false,
    canCopy,
    remaining: canCopy ? 1 : 0,
    isPremiumUser: false,
    isAdmin: false,
    reason: trial.expired ? "TRIAL_EXPIRED" : alreadyCopied ? "COPY_LIMIT_REACHED" : null,
    trial: trialInfo,
  });
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
