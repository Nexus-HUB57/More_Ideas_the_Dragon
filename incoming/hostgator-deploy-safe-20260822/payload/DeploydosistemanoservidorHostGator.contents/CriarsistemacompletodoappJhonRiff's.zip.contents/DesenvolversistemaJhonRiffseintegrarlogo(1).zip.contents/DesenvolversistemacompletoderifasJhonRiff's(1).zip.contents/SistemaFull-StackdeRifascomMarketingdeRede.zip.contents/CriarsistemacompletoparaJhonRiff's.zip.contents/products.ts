import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { products } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAllProducts, getProductById } from '../db';

export const productsRouter = router({
  getAllProducts: protectedProcedure.query(async () => {
    return await getAllProducts();
  }),

  getProductById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getProductById(input.id);
    }),

  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
        affiliateCommission: z.number().default(10),
        fileUrl: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can create products');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.insert(products).values({
        name: input.name,
        description: input.description,
        price: input.price,
        affiliateCommission: input.affiliateCommission,
        fileUrl: input.fileUrl,
        category: input.category,
        status: 'active',
      });

      return { success: true };
    }),

  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        affiliateCommission: z.number().optional(),
        fileUrl: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(['active', 'inactive']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can update products');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.price !== undefined) updateData.price = input.price;
      if (input.affiliateCommission !== undefined) updateData.affiliateCommission = input.affiliateCommission;
      if (input.fileUrl !== undefined) updateData.fileUrl = input.fileUrl;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.status !== undefined) updateData.status = input.status;

      await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can delete products');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(products)
        .set({ status: 'inactive' })
        .where(eq(products.id, input.id));

      return { success: true };
    }),
});
