import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { storagePut, storageDelete } from "./storage";
import { 
  updateAgentAvatar, 
  updateNFTAssetMedia, 
  updateProjectRepository 
} from "./db";

export const storageRouter = router({
  // Upload de avatar para agente
  uploadAvatar: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      fileBase64: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, 'base64');
      const result = await storagePut(buffer, `avatars/${input.agentId}`, 'image/png');
      
      await updateAgentAvatar(input.agentId, result.url);
      
      return { success: true, url: result.url };
    }),

  // Upload de mídia para NFT (Asset Lab)
  uploadNFTMedia: protectedProcedure
    .input(z.object({
      assetId: z.string(),
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, 'base64');
      const result = await storagePut(buffer, `assets/${input.assetId}`, input.mimeType);
      
      await updateNFTAssetMedia(input.assetId, result.url);
      
      return { success: true, url: result.url };
    }),

  // Upload de repositório/projeto (Forge Projects)
  uploadProjectBundle: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      fileBase64: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, 'base64');
      const result = await storagePut(buffer, `projects/${input.projectId}`, 'application/zip');
      
      await updateProjectRepository(input.projectId, result.url);
      
      return { success: true, url: result.url };
    }),

  // Remover arquivo
  deleteFile: protectedProcedure
    .input(z.object({
      key: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await storageDelete(input.key);
    }),
});
