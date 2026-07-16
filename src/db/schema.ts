import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").default("").notNull(),
  icon: varchar("icon", { length: 16 }).default("✨").notNull(),
  color: varchar("color", { length: 32 }).default("#6366f1").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  description: text("description").default("").notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  usage: text("usage").default("").notNull(),
  exampleOutput: text("example_output").default("").notNull(),
  level: varchar("level", { length: 32 }).default("Pemula").notNull(),
  language: varchar("language", { length: 32 }).default("Indonesia").notNull(),
  supportedAi: jsonb("supported_ai").$type<string[]>().default([]).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  followUps: jsonb("follow_ups").$type<string[]>().default([]).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  isTrending: boolean("is_trending").default(false).notNull(),
  isBestSeller: boolean("is_best_seller").default(false).notNull(),
  usersCount: integer("users_count").default(0).notNull(),
  copyCount: integer("copy_count").default(0).notNull(),
  ratingSum: integer("rating_sum").default(0).notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  version: varchar("version", { length: 16 }).default("1.0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id")
    .references(() => prompts.id, { onDelete: "cascade" })
    .notNull(),
  author: varchar("author", { length: 120 }).default("Anonim").notNull(),
  rating: integer("rating").default(5).notNull(),
  comment: text("comment").default("").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id", { length: 64 }).notNull(),
  promptId: integer("prompt_id")
    .references(() => prompts.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  price: integer("price").default(0).notNull(),
  period: varchar("period", { length: 32 }).default("bulan").notNull(),
  highlighted: boolean("highlighted").default(false).notNull(),
  features: jsonb("features").$type<string[]>().default([]).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }).default("").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  role: varchar("role", { length: 32 }).default("user").notNull(), // user, admin, superadmin
  planSlug: varchar("plan_slug", { length: 64 }).default("free").notNull(),
  status: varchar("status", { length: 32 }).default("active").notNull(), // active, pending, rejected
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyAcceptedAt: timestamp("privacy_accepted_at"),
  legalVersion: varchar("legal_version", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profiles.id),
  planId: integer("plan_id").references(() => plans.id),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 32 }).default("pending").notNull(), // pending, approved, rejected, cancelled, expired
  paymentProof: text("payment_proof"),
  // Midtrans integration fields
  midtransOrderId: varchar("midtrans_order_id", { length: 100 }),
  midtransToken: varchar("midtrans_token", { length: 200 }),
  midtransRedirectUrl: text("midtrans_redirect_url"),
  paymentMethod: varchar("payment_method", { length: 64 }),
  paymentType: varchar("payment_type", { length: 64 }),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profiles.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  type: varchar("type", { length: 32 }).default("info").notNull(), // info, success, warning, order
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tracking copy per-user per-prompt untuk membatasi user gratis (1x copy).
// clientId dipakai untuk user anonim, profileId dipakai untuk user login.
export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deviceTrials = pgTable("device_trials", {
  id: serial("id").primaryKey(),
  deviceId: varchar("device_id", { length: 64 }).notNull().unique(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  blockedAt: timestamp("blocked_at"),
});

export const promptCopies = pgTable("prompt_copies", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id", { length: 64 }),
  profileId: integer("profile_id").references(() => profiles.id),
  promptId: integer("prompt_id")
    .references(() => prompts.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("prompt_copies_profile_prompt_unique")
    .on(table.profileId, table.promptId)
    .where(sql`${table.profileId} IS NOT NULL`),
  uniqueIndex("prompt_copies_client_prompt_unique")
    .on(table.clientId, table.promptId)
    .where(sql`${table.clientId} IS NOT NULL`),
]);

export type Category = typeof categories.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
