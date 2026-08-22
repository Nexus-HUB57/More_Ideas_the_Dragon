import { getDb } from './db';
import { commissions, affiliates } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const COMMISSION_PERCENTAGES = {
  1: 10,
  2: 5,
  3: 2.5,
  4: 2.5,
};

export async function calculateUnilevelCommissions(
  saleId: number,
  affiliateId: number,
  saleAmount: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const affiliate = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, affiliateId))
    .limit(1);

  if (affiliate.length === 0) {
    throw new Error('Affiliate not found');
  }

  let currentSponsorId = affiliate[0].sponsorId;
  let level = 1;
  const maxLevels = 4;

  while (currentSponsorId && level <= maxLevels) {
    const sponsor = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, currentSponsorId))
      .limit(1);

    if (sponsor.length === 0) break;

    const sponsorAffiliate = sponsor[0];
    const percentage = COMMISSION_PERCENTAGES[level as keyof typeof COMMISSION_PERCENTAGES] || 0;

    if (percentage > 0) {
      const commissionAmount = Math.floor((saleAmount * percentage) / 100);

      await db.insert(commissions).values({
        affiliateId: sponsorAffiliate.id,
        saleId,
        networkLevel: level,
        amount: commissionAmount,
        percentage: Math.floor(percentage * 100),
        status: 'pending',
      });

      await db
        .update(affiliates)
        .set({
          availableBalance: sponsorAffiliate.availableBalance + commissionAmount,
          totalCommissions: sponsorAffiliate.totalCommissions + commissionAmount,
        })
        .where(eq(affiliates.id, sponsorAffiliate.id));
    }

    currentSponsorId = sponsorAffiliate.sponsorId;
    level++;
  }
}

export async function addCareerPoints(
  affiliateId: number,
  saleAmount: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const points = saleAmount;

  const affiliate = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, affiliateId))
    .limit(1);

  if (affiliate.length > 0) {
    await db
      .update(affiliates)
      .set({
        accumulatedPoints: affiliate[0].accumulatedPoints + points,
      })
      .where(eq(affiliates.id, affiliateId));
  }
}

export async function getAffiliatesPendingCommissionsTotal(
  affiliateId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(commissions)
    .where(
      eq(commissions.affiliateId, affiliateId) &&
      eq(commissions.status, 'pending')
    );

  return result.reduce((total, commission) => total + commission.amount, 0);
}
