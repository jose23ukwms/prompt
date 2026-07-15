import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { prompts, promptCopies } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
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
    .select({ id: prompts.id, isPremium: prompts.isPremium })
    .from(prompts)
    .where(eq(prompts.id, promptId))
    .limit(1);
  if (!prompt) return NextResponse.json({ ok: false }, { status: 404 });

  const profile = await findProfileByEmail(
    typeof body.profileEmail === "string" ? body.profileEmail : null
  );
  const unlimited = hasUnlimitedAccess(profile);

  if (!unlimited && prompt.isPremium) {
    return NextResponse.json(
      { ok: false, error: "PREMIUM_REQUIRED", message: "Prompt ini membutuhkan akun Premium." },
      { status: 403 }
    );
  }

  let deviceId: string | null = null;
  let trialInfo = null;
  let isNewCookie = false;
  if (!unlimited) {
    const cookieStore = await cookies();
    deviceId = cookieStore.get(DEVICE_COOKIE)?.value ?? null;
    if (!deviceId) {
      deviceId = crypto.randomUUID().replaceAll("-", "");
      isNewCookie = true;
    }
    const trial = await ensureDeviceTrial(deviceId);
    trialInfo = trialPayload(trial);
    if (trial.expired) {
      return NextResponse.json(
        {
          ok: false,
          error: "TRIAL_EXPIRED",
          message: "Masa akses gratis 7 hari telah berakhir. Upgrade untuk melanjutkan.",
          trial: trialInfo,
        },
        { status: 403 }
      );
    }

    let alreadyCopied = false;
    if (profile?.id) {
      const [row] = await db
        .select({ id: promptCopies.id })
        .from(promptCopies)
        .where(and(eq(promptCopies.promptId, promptId), eq(promptCopies.profileId, profile.id)))
        .limit(1);
      alreadyCopied = Boolean(row);
    }
    if (!alreadyCopied && deviceId) {
      const [row] = await db
        .select({ id: promptCopies.id })
        .from(promptCopies)
        .where(and(eq(promptCopies.promptId, promptId), eq(promptCopies.clientId, deviceId)))
        .limit(1);
      alreadyCopied = Boolean(row);
    }
    if (alreadyCopied) {
      return NextResponse.json(
        {
          ok: false,
          error: "COPY_LIMIT_REACHED",
          message: "Paket gratis hanya dapat menyalin setiap prompt satu kali.",
          trial: trialInfo,
        },
        { status: 429 }
      );
    }
  }

  if (!unlimited) {
    try {
      await db.insert(promptCopies).values({
        clientId: deviceId,
        profileId: profile?.id ?? null,
        promptId,
      });
    } catch {
      return NextResponse.json(
        { ok: false, error: "COPY_LIMIT_REACHED", message: "Prompt ini sudah pernah disalin." },
        { status: 429 }
      );
    }
  }

  await db
    .update(prompts)
    .set({ copyCount: sql`${prompts.copyCount} + 1` })
    .where(eq(prompts.id, promptId));

  const response = NextResponse.json({
    ok: true,
    remaining: unlimited ? "unlimited" : 0,
    trial: trialInfo,
  });
  if (isNewCookie && deviceId) {
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
