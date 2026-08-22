export async function getCareerLevels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(careerLevels);
}

export async function getCareerLevelByLevel(level: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(careerLevels).where(eq(careerLevels.level, level)).limit(1);
  return result[0];
}

// ===== AFFILIATE NETWORK =====
export async function createAffiliateLink(link: InsertAffiliateNetwork) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(affiliateNetwork).values(link);
}

export async function getAffiliateDownline(referrerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateNetwork).where(eq(affiliateNetwork.referrerId, referrerId));
}

// ===== LOTTERIES =====
export async function createLottery(lottery: InsertLottery) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(lotteries).values(lottery);
}

export async function getLotteries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lotteries);
}

export async function getLotteryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lotteries).where(eq(lotteries.id, id)).limit(1);
  return result[0];
}

// ===== LOTTERY TICKETS =====
export async function createLotteryTicket(ticket: InsertLotteryTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(lotteryTickets).values(ticket);
}

export async function getUserLotteryTickets(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lotteryTickets).where(eq(lotteryTickets.ownerId, ownerId));
}

// ===== PAYMENTS =====
export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(payments).values(payment);
}

export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.userId, userId));