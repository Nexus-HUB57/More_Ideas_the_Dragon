/**
 * API REST para o Módulo de Criação de Vídeos
 * Rotas: POST /generate, GET /progress, GET /list, POST /cancel, DELETE /:videoId
 * Adaptado do tRPC router para Express REST puro
 */

import { Router, Request, Response } from 'express';
import { PipelineOrchestrator } from '../services/pipelineOrchestrator';
import { VideoPrompt } from '../services/scriptGenerationService';

export const videoRouter = Router();

/**
 * POST /api/video/generate
 * Inicia a geração de um novo vídeo
 */
videoRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, maxDuration = 60 } = req.body;

    if (!prompt || !prompt.theme || !prompt.style || !prompt.tone) {
      res.status(400).json({
        success: false,
        error: 'Prompt with theme, style, and tone is required',
      });
      return;
    }

    // Gerar ID único para o vídeo
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    console.log(`[videoApi] Starting video generation: ${videoId}`);

    // Iniciar pipeline de forma assíncrona (fire-and-forget)
    PipelineOrchestrator.orchestrateVideoGeneration(videoId, prompt as VideoPrompt).catch(error => {
      console.error(`[videoApi] Pipeline error for ${videoId}:`, error);
    });

    res.json({
      success: true,
      videoId,
      message: 'Video generation started',
    });
  } catch (error) {
    console.error('[videoApi] Error starting video generation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start video generation',
    });
  }
});

/**
 * GET /api/video/progress
 * Obtém o progresso da geração de um vídeo
 */
videoRouter.get('/progress', (req: Request, res: Response) => {
  try {
    const videoId = req.query.videoId as string;

    if (!videoId) {
      res.status(400).json({
        success: false,
        error: 'videoId query parameter is required',
      });
      return;
    }

    const progress = PipelineOrchestrator.getProgress(videoId);

    if (!progress) {
      res.status(404).json({
        success: false,
        error: 'Video not found or progress not available',
      });
      return;
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('[videoApi] Error getting progress:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get progress',
    });
  }
});

/**
 * GET /api/video/list
 * Lista todos os vídeos em memória
 */
videoRouter.get('/list', (_req: Request, res: Response) => {
  try {
    const videos = PipelineOrchestrator.listAllVideos();
    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error('[videoApi] Error listing videos:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list videos',
    });
  }
});

/**
 * GET /api/video/:videoId
 * Obtém detalhes de um vídeo específico
 */
videoRouter.get('/:videoId', (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const progress = PipelineOrchestrator.getProgress(videoId);

    if (!progress) {
      res.status(404).json({
        success: false,
        error: 'Video not found',
      });
      return;
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('[videoApi] Error getting video details:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get video details',
    });
  }
});

/**
 * POST /api/video/cancel
 * Cancela a geração de um vídeo em progresso
 */
videoRouter.post('/cancel', (req: Request, res: Response) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      res.status(400).json({
        success: false,
        error: 'videoId is required',
      });
      return;
    }

    PipelineOrchestrator.cancelVideoGeneration(videoId);

    res.json({
      success: true,
      message: 'Video generation cancelled',
    });
  } catch (error) {
    console.error('[videoApi] Error cancelling video generation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel video generation',
    });
  }
});

/**
 * DELETE /api/video/:videoId
 * Remove um vídeo da memória
 */
videoRouter.delete('/:videoId', (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    PipelineOrchestrator.clearProgress(videoId);

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('[videoApi] Error deleting video:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete video',
    });
  }
});
