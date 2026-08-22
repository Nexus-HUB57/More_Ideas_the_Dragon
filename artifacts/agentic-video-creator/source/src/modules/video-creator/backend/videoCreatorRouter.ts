/**
 * APIs tRPC para o Módulo de Criação de Vídeos
 * Expõe procedimentos para iniciar geração, obter progresso e listar vídeos
 */

import { z } from 'zod';
import { PipelineOrchestrator } from '../services/pipelineOrchestrator';
import { VideoPrompt, VideoGenerationProgress } from '../types/index';

// Schemas de validação Zod
const VideoPromptSchema = z.object({
  theme: z.string().min(1, 'Theme is required'),
  style: z.string().min(1, 'Style is required'),
  tone: z.string().min(1, 'Tone is required'),
  additionalContext: z.string().optional(),
});

const VideoGenerationRequestSchema = z.object({
  prompt: VideoPromptSchema,
  maxDuration: z.number().int().min(10).max(60).default(60),
});

/**
 * Cria um router tRPC para o módulo de criação de vídeos
 * @param t - Contexto tRPC
 * @returns Router com procedimentos de vídeo
 */
export function createVideoCreatorRouter(t: any) {
  return t.router({
    /**
     * Inicia a geração de um novo vídeo
     * POST /api/trpc/videoCreator.startGeneration
     */
    startGeneration: t.procedure
      .input(VideoGenerationRequestSchema)
      .mutation(async ({ input, ctx }) => {
        try {
          // Validar autenticação
          if (!ctx.user) {
            throw new Error('User not authenticated');
          }

          // Gerar ID único para o vídeo
          const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // TODO: Persistir vídeo no banco de dados com status 'pending'
          console.log(`[videoCreatorRouter] Starting video generation: ${videoId}`);

          // Iniciar pipeline de forma assíncrona (não aguardar conclusão)
          PipelineOrchestrator.orchestrateVideoGeneration(videoId, input.prompt).catch(error => {
            console.error(`[videoCreatorRouter] Pipeline error for ${videoId}:`, error);
          });

          return {
            success: true,
            videoId,
            message: 'Video generation started',
          };
        } catch (error) {
          console.error('[videoCreatorRouter] Error starting video generation:', error);
          throw new Error(error instanceof Error ? error.message : 'Failed to start video generation');
        }
      }),

    /**
     * Obtém o progresso da geração de um vídeo
     * GET /api/trpc/videoCreator.getProgress?videoId=...
     */
    getProgress: t.procedure
      .input(z.object({ videoId: z.string() }))
      .query(({ input }) => {
        try {
          const progress = PipelineOrchestrator.getProgress(input.videoId);

          if (!progress) {
            return {
              success: false,
              error: 'Video not found or progress not available',
            };
          }

          return {
            success: true,
            data: progress,
          };
        } catch (error) {
          console.error('[videoCreatorRouter] Error getting progress:', error);
          throw new Error(error instanceof Error ? error.message : 'Failed to get progress');
        }
      }),

    /**
     * Lista todos os vídeos do usuário autenticado
     * GET /api/trpc/videoCreator.listUserVideos
     */
    listUserVideos: t.procedure.query(async ({ ctx }) => {
      try {
        // Validar autenticação
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }

        // TODO: Buscar vídeos do usuário no banco de dados
        // Por enquanto, retornar lista vazia
        const userVideos: any[] = [];

        return {
          success: true,
          data: userVideos,
        };
      } catch (error) {
        console.error('[videoCreatorRouter] Error listing user videos:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to list videos');
      }
    }),

    /**
     * Obtém detalhes de um vídeo específico
     * GET /api/trpc/videoCreator.getVideoDetails?videoId=...
     */
    getVideoDetails: t.procedure
      .input(z.object({ videoId: z.string() }))
      .query(async ({ input, ctx }) => {
        try {
          // Validar autenticação
          if (!ctx.user) {
            throw new Error('User not authenticated');
          }

          // TODO: Buscar detalhes do vídeo no banco de dados
          // Validar que o vídeo pertence ao usuário autenticado
          const videoDetails = {
            videoId: input.videoId,
            userId: ctx.user.id,
            prompt: {
              theme: 'Example Theme',
              style: 'Example Style',
              tone: 'Example Tone',
            },
            status: 'completed',
            videoUrl: 'https://example.com/video.mp4',
            thumbnailUrl: 'https://example.com/thumbnail.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            success: true,
            data: videoDetails,
          };
        } catch (error) {
          console.error('[videoCreatorRouter] Error getting video details:', error);
          throw new Error(error instanceof Error ? error.message : 'Failed to get video details');
        }
      }),

    /**
     * Cancela a geração de um vídeo em progresso
     * POST /api/trpc/videoCreator.cancelGeneration
     */
    cancelGeneration: t.procedure
      .input(z.object({ videoId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Validar autenticação
          if (!ctx.user) {
            throw new Error('User not authenticated');
          }

          // TODO: Validar que o vídeo pertence ao usuário autenticado
          PipelineOrchestrator.cancelVideoGeneration(input.videoId);

          return {
            success: true,
            message: 'Video generation cancelled',
          };
        } catch (error) {
          console.error('[videoCreatorRouter] Error cancelling video generation:', error);
          throw new Error(error instanceof Error ? error.message : 'Failed to cancel video generation');
        }
      }),

    /**
     * Deleta um vídeo
     * POST /api/trpc/videoCreator.deleteVideo
     */
    deleteVideo: t.procedure
      .input(z.object({ videoId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Validar autenticação
          if (!ctx.user) {
            throw new Error('User not authenticated');
          }

          // TODO: Validar que o vídeo pertence ao usuário autenticado
          // TODO: Deletar vídeo e seus assets do S3 e banco de dados
          PipelineOrchestrator.clearProgress(input.videoId);

          return {
            success: true,
            message: 'Video deleted successfully',
          };
        } catch (error) {
          console.error('[videoCreatorRouter] Error deleting video:', error);
          throw new Error(error instanceof Error ? error.message : 'Failed to delete video');
        }
      }),
  });
}
