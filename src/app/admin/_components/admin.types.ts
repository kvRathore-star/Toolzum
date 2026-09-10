export interface AdminStats {
  totalUsers: number;
  proUsers: number;
  signedinUsers: number;
  adminUsers: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
  pageViewsLast7Days: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  revenueLast30Days: number;
  paidCountLast30Days: number;
  activeSubscribers: number;
  proBlocks24h: number;
  proBlocks7d: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  credits: number;
  status: string;
  lastLoginAt: number | null;
  createdAt: number;
  image: string | null;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface Payment {
  id: string;
  gateway: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: number;
}

export interface ToolUsage {
  toolSlug: string;
  count: number;
}

export interface AuditEntry {
  actorEmail: string;
  actorUserName: string | null;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface UserDetail {
  user: User;
  payments: Payment[];
  toolUsage: ToolUsage[];
  roleHistory: AuditEntry[];
}

export interface AuditLogEntry {
  id: number;
  actorEmail: string;
  actorUserName: string | null;
  action: string;
  targetUserId: string;
  targetUserName: string | null;
  targetUserEmail: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: number;
  expiresAt: number;
}

export interface PlatformPayment {
  id: string;
  userId: string;
  gateway: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: number;
  userName: string | null;
  userEmail: string | null;
}
