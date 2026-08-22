import { eq, and, desc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, affiliates, agents, commissions, sales, products, notifications, withdrawals, favorites } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== Affiliate Functions ====================

export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getNetworkTree(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get the user's affiliate record
  const userAffiliate = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
  if (!userAffiliate.length) return [];

  const affiliateId = userAffiliate[0].id;

  // Get all affiliates in the network starting from this user
  const allAffiliates = await db.select().from(affiliates).where(eq(affiliates.parentId, affiliateId));

  // Build tree structure recursively
  const buildTree = async (parentId: number, level: number): Promise<any[]> => {
    const children = await db.select().from(affiliates).where(eq(affiliates.parentId, parentId));
    
    return Promise.all(children.map(async (child) => {
      const childUser = await db.select().from(users).where(eq(users.id, child.userId)).limit(1);
      const grandchildren = await buildTree(child.id, level + 1);
      
      return {
        id: child.id,
        name: childUser[0]?.name || "Unknown",
        level: level,
        commission: child.commission,
        children: grandchildren,
      };
    }));
  };

  const tree = await buildTree(affiliateId, 1);
  return tree;
}

// ==================== Agent Functions ====================

export async function getAgentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agents).where(eq(agents.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAgentForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.insert(agents).values({
      userId,
      name: `Agent-${userId}`,
      status: "inactive",
    });
    
    return await getAgentByUserId(userId);
  } catch (error) {
    console.error("[Database] Failed to create agent:", error);
    return undefined;
  }
}

export async function updateAgentStrategy(agentId: number, strategy: string) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    await db.update(agents).set({ strategy }).where(eq(agents.id, agentId));
    return await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
  } catch (error) {
    console.error("[Database] Failed to update agent strategy:", error);
    return undefined;
  }
}

// ==================== Commission Functions ====================

export async function getCommissionsByUserId(userId: number, period?: string) {
  const db = await getDb();
  if (!db) return [];

  if (period) {
    return db.select().from(commissions)
      .where(and(eq(commissions.userId, userId), eq(commissions.period, period)))
      .orderBy(desc(commissions.createdAt));
  }

  return db.select().from(commissions)
    .where(eq(commissions.userId, userId))
    .orderBy(desc(commissions.createdAt));
}

export async function getTotalCommissions(userId: number) {
  const db = await getDb();
  if (!db) return "0";

  const result = await db.select().from(commissions)
    .where(and(eq(commissions.userId, userId), eq(commissions.status, "confirmed")));

  const total = result.reduce((sum, c) => sum + parseFloat(c.amount as any), 0);
  return total.toFixed(2);
}

// ==================== Sales Functions ====================

export async function getRecentSalesByAffiliateId(affiliateId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(sales)
    .where(eq(sales.affiliateId, affiliateId))
    .orderBy(desc(sales.createdAt))
    .limit(limit);
}

// ==================== Product Functions ====================

export async function getProductsByMarketplace(marketplace?: string) {
  const db = await getDb();
  if (!db) return [];

  if (marketplace) {
    return db.select().from(products)
      .where(and(eq(products.status, "active"), eq(products.marketplace, marketplace)));
  }

  return db.select().from(products).where(eq(products.status, "active"));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== Favorites Functions ====================

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function toggleFavorite(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    const existing = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
      return false; // Removed from favorites
    } else {
      await db.insert(favorites).values({ userId, productId });
      return true; // Added to favorites
    }
  } catch (error) {
    console.error("[Database] Failed to toggle favorite:", error);
    return false;
  }
}

// ==================== Notification Functions ====================

export async function getNotificationsByUserId(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function createNotification(userId: number, type: string, title: string, content?: string, relatedId?: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.insert(notifications).values({
      userId,
      type: type as any,
      title,
      content,
      relatedId,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to create notification:", error);
    return undefined;
  }
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    return false;
  }
}

// ==================== Withdrawal Functions ====================

export async function createWithdrawalRequest(userId: number, amount: string, bankAccount: string) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.insert(withdrawals).values({
      userId,
      amount: amount as any,
      bankAccount,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to create withdrawal request:", error);
    return undefined;
  }
}

export async function getWithdrawalsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(desc(withdrawals.requestedAt));
}
