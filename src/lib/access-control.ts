import "server-only";

import { db } from "@/db";
import { deviceTrials, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEVICE_COOKIE = "sd_device_trial";
export const FREE_TRIAL_DAYS = 7;
export const LEGAL_VERSION = "2026-07-05";

export type AccessProfile = typeof profiles.$inferSelect | null;

export async function findProfileByEmail(email?: string | null): Promise<AccessProfile> {
  if (!email) return null;
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email.trim().toLowerCase()))
    .limit(1);
  return profile ?? null;
}

export function hasUnlimitedAccess(profile: AccessProfile) {
  if (!profile) return false;
  const privilegedRole = profile.role === "admin" || profile.role === "superadmin";
  const paidActive = profile.planSlug !== "free" && profile.status === "active";
  return privilegedRole || paidActive;
}

export async function ensureDeviceTrial(deviceId: string) {
  const now = new Date();
  const [existing] = await db
    .select()
    .from(deviceTrials)
    .where(eq(deviceTrials.deviceId, deviceId))
    .limit(1);

  if (existing) {
    await db
      .update(deviceTrials)
      .set({ lastSeenAt: now })
      .where(eq(deviceTrials.id, existing.id));
    const expired = existing.expiresAt.getTime() <= now.getTime();
    return {
      ...existing,
      expired: expired || Boolean(existing.blockedAt),
      remainingMs: Math.max(0, existing.expiresAt.getTime() - now.getTime()),
    };
  }

  const expiresAt = new Date(now.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const [created] = await db
    .insert(deviceTrials)
    .values({ deviceId, firstSeenAt: now, lastSeenAt: now, expiresAt })
    .returning();

  return {
    ...created,
    expired: false,
    remainingMs: expiresAt.getTime() - now.getTime(),
  };
}

export function trialPayload(trial: Awaited<ReturnType<typeof ensureDeviceTrial>>) {
  const remainingDays = Math.max(0, Math.ceil(trial.remainingMs / (24 * 60 * 60 * 1000)));
  return {
    active: !trial.expired,
    expired: trial.expired,
    firstSeenAt: trial.firstSeenAt,
    expiresAt: trial.expiresAt,
    remainingDays,
    trialDays: FREE_TRIAL_DAYS,
  };
}
