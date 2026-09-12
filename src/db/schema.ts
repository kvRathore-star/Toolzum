import { sqliteTable, text, integer, real, primaryKey, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  // Custom fields for SaaS
  credits: integer("credits").default(30).notNull(),
  creditResetAt: integer("creditResetAt", { mode: "timestamp" }),
  // Written by the session-create hook in src/lib/auth.ts (unix seconds).
  // Column predates the schema entry (created out-of-band in D1).
  lastLoginAt: integer("lastLoginAt"),
  plan: text("plan").default("free").notNull(),
  role: text("role").default("user").notNull(),
  status: text("status").default("active").notNull(),
});

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  issuer: text("issuer").notNull(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

// SaaS Payments & Subscriptions
export const payments = sqliteTable("payment", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  gateway: text("gateway").notNull(), // 'razorpay' | 'dodo'
  orderId: text("orderId").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(), // 'created' | 'paid' | 'failed'
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const downloadUsage = sqliteTable("download_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fingerprint: text("fingerprint").notNull(),
  date: text("date").notNull(), // "YYYY-M-D"
  count: integer("count").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const analyticsEvents = sqliteTable("analytics_event", {
  id: text("id").primaryKey(),
  path: text("path").notNull(),
  fingerprint: text("fingerprint"),
  clientType: text("clientType"), // 'web' | 'extension'
  viewport: text("viewport"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const userFavorites = sqliteTable("user_favorite", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  toolSlug: text("toolSlug").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.toolSlug] }),
  index("user_favorite_userId_idx").on(t.userId),
]);

export const userToolUsage = sqliteTable("user_tool_usage", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  toolSlug: text("toolSlug").notNull(),
  toolName: text("toolName").notNull(),
  category: text("category"),
  usedAt: integer("usedAt", { mode: "timestamp" }).notNull(),
}, (t) => [
  index("user_tool_usage_userId_idx").on(t.userId),
  index("user_tool_usage_usedAt_idx").on(t.usedAt),
]);


