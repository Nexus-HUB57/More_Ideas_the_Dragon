import { createHash } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { nftAssets, type InsertNFTAsset } from "../../drizzle/schema";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const assetInput = z.object({
  agentId: z.string().min(1),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sha256Hash: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0"),
  mediaUrl: z.string().url().optional(),
  mediaType: z.string().max(64).optional(),
});

export const assetsRouter = router({
  list: publicProcedure
    .input(z.object({ agentId: z.string().min(1).optional(), limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const query = input?.agentId
        ? db.select().from(nftAssets).where(eq(nftAssets.agentId, input.agentId)).orderBy(desc(nftAssets.updatedAt))
        : db.select().from(nftAssets).orderBy(desc(nftAssets.updatedAt));
      return query.limit(input?.limit ?? 50);
    }),

  getById: publicProcedure
    .input(z.object({ assetId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(nftAssets).where(eq(nftAssets.assetId, input.assetId)).limit(1);
      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(assetInput)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const asset: InsertNFTAsset = {
        assetId: nanoid(),
        agentId: input.agentId,
        name: input.name,
        description: input.description,
        metadata: input.metadata,
        sha256Hash: input.sha256Hash ?? createHash("sha256").update(`${input.agentId}:${input.name}:${Date.now()}`).digest("hex"),
        value: input.value,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
      };
      await db.insert(nftAssets).values(asset);
      return asset;
    }),

  uploadMedia: protectedProcedure
    .input(z.object({ filename: z.string().regex(/^[a-zA-Z0-9._-]+$/).max(180), mimeType: z.string().max(120), base64: z.string().min(1), agentId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("Asset media exceeds the 10 MB limit");
      const key = `nexus-assets/${input.agentId}/${nanoid()}-${input.filename}`;
      const uploaded = await storagePut(key, bytes, input.mimeType);
      return {
        ...uploaded,
        sha256Hash: createHash("sha256").update(bytes).digest("hex"),
        size: bytes.byteLength,
        mimeType: input.mimeType,
      };
    }),

  update: protectedProcedure
    .input(z.object({ assetId: z.string().min(1), name: z.string().trim().min(1).max(255).optional(), description: z.string().trim().max(10000).optional(), value: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(), metadata: z.record(z.string(), z.unknown()).optional(), mediaUrl: z.string().url().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { assetId, ...changes } = input;
      await db.update(nftAssets).set(changes).where(eq(nftAssets.assetId, assetId));
      const result = await db.select().from(nftAssets).where(eq(nftAssets.assetId, assetId)).limit(1);
      return result[0] ?? null;
    }),
});
