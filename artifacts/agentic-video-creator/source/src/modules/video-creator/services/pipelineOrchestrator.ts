/**
 * Orquestrador do Pipeline Agêntico de Geração de Vídeos
 * Coordena as etapas sequenciais: roteiro → imagens → áudio → composição
 */

import { VideoPrompt, VideoScript, VideoGenerationProgress, VideoStatus } from '../types/index';
import { ScriptGenerationService } from './scriptGenerationService';
import { ImageGenerationService } from './imageGenerationService';
import { AudioGenerationService } from './audioGenerationService';

// Simulação de armazenamento de progresso (será substituído por banco de dados real)
const progressMap = new Map<string, VideoGenerationProgress>();

export class PipelineOrchestrator {
  /**
   * Inicia o pipeline de geração de vídeo
   * @param videoId - ID único do vídeo
   * @param prompt - Prompt do usuário
   * @returns Promise<void>
   */
  static async orchestrateVideoGeneration(videoId: string, prompt: VideoPrompt): Promise<void> {
    try {
      // Inicializar progresso
      this.updateProgress(videoId, 'pending', 'Iniciando pipeline de geração de vídeo', 0);

      // Etapa 1: Geração de Roteiro
      console.log(`[PipelineOrchestrator] Starting script generation for video: ${videoId}`);
      this.updateProgress(videoId, 'pending', 'Gerando roteiro...', 10);

      const scriptResult = await ScriptGenerationService.generateScript(videoId, prompt);
      if (!scriptResult.success || !scriptResult.data) {
        throw new Error(scriptResult.error || 'Script generation failed');
      }

      const script: VideoScript = scriptResult.data;
      this.updateProgress(videoId, 'script_generated', 'Roteiro gerado com sucesso', 25);
      console.log(`[PipelineOrchestrator] Script generated with ${script.scenes.length} scenes`);

      // Etapa 2: Geração de Imagens
      console.log(`[PipelineOrchestrator] Starting image generation for video: ${videoId}`);
      this.updateProgress(videoId, 'script_generated', 'Gerando imagens para cada cena...', 30);

      const imageResult = await ImageGenerationService.generateImagesForScenes(script.scenes);
      if (!imageResult.success || !imageResult.data) {
        throw new Error(imageResult.error || 'Image generation failed');
      }

      // Atualizar URLs de imagens nas cenas
      const imageMap = new Map(imageResult.data.map(img => [img.sceneId, img.imageUrl]));
      script.scenes.forEach(scene => {
        scene.imageUrl = imageMap.get(scene.sceneId);
      });

      this.updateProgress(videoId, 'images_generated', 'Imagens geradas com sucesso', 50);
      console.log(`[PipelineOrchestrator] Images generated for ${script.scenes.length} scenes`);

      // Etapa 3: Síntese de Narração (TTS)
      console.log(`[PipelineOrchestrator] Starting audio generation for video: ${videoId}`);
      this.updateProgress(videoId, 'images_generated', 'Gerando narração em áudio...', 55);

      const audioResult = await AudioGenerationService.generateAudioForScenes(script.scenes);
      if (!audioResult.success || !audioResult.data) {
        throw new Error(audioResult.error || 'Audio generation failed');
      }

      // Atualizar URLs de áudio nas cenas
      const audioMap = new Map(audioResult.data.map(audio => [audio.sceneId, audio.audioUrl]));
      script.scenes.forEach(scene => {
        scene.audioUrl = audioMap.get(scene.sceneId);
      });

      this.updateProgress(videoId, 'audio_generated', 'Narração gerada com sucesso', 70);
      console.log(`[PipelineOrchestrator] Audio generated for ${script.scenes.length} scenes`);

      // Etapa 4: Composição Final (FFmpeg)
      console.log(`[PipelineOrchestrator] Starting video composition for video: ${videoId}`);
      this.updateProgress(videoId, 'audio_generated', 'Compondo vídeo final...', 75);

      // TODO: Integrar com FFmpeg para composição do vídeo
      // Por enquanto, simular a composição
      await this.simulateVideoComposition(videoId, script);

      this.updateProgress(videoId, 'completed', 'Vídeo gerado com sucesso!', 100);
      console.log(`[PipelineOrchestrator] Video generation completed for video: ${videoId}`);
    } catch (error) {
      console.error(`[PipelineOrchestrator] Error orchestrating video generation:`, error);
      this.updateProgress(
        videoId,
        'failed',
        `Erro na geração do vídeo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtém o progresso atual da geração de um vídeo
   * @param videoId - ID do vídeo
   * @returns VideoGenerationProgress | undefined
   */
  static getProgress(videoId: string): VideoGenerationProgress | undefined {
    return progressMap.get(videoId);
  }

  /**
   * Atualiza o progresso da geração de um vídeo
   * @param videoId - ID do vídeo
   * @param status - Status atual
   * @param message - Mensagem descritiva
   * @param progress - Percentual de progresso (0-100)
   * @param error - Mensagem de erro (opcional)
   */
  private static updateProgress(
    videoId: string,
    status: VideoStatus,
    message: string,
    progress: number,
    error?: string
  ): void {
    const progressData: VideoGenerationProgress = {
      videoId,
      status,
      currentStep: message,
      progress: Math.min(progress, 100),
      message,
      error,
      timestamp: new Date(),
    };

    progressMap.set(videoId, progressData);
    console.log(`[PipelineOrchestrator] Progress updated: ${videoId} - ${status} (${progress}%)`);

    // TODO: Persistir progresso no banco de dados para sincronização em tempo real
  }

  /**
   * Simula a composição de vídeo com FFmpeg
   * @param videoId - ID do vídeo
   * @param script - Script com cenas, imagens e áudios
   */
  private static async simulateVideoComposition(videoId: string, script: VideoScript): Promise<void> {
    // Simular latência de composição (proporcional ao número de cenas)
    const compositionTime = script.scenes.length * 2000; // 2 segundos por cena
    await new Promise(resolve => setTimeout(resolve, compositionTime));

    // TODO: Implementar composição real com FFmpeg
    // Retornar URLs reais do vídeo e miniatura no S3
    console.log(`[PipelineOrchestrator] Video composition simulated for ${script.scenes.length} scenes`);
  }

  /**
   * Cancela a geração de um vídeo em progresso
   * @param videoId - ID do vídeo
   */
  static cancelVideoGeneration(videoId: string): void {
    const progress = progressMap.get(videoId);
    if (progress && progress.status !== 'completed' && progress.status !== 'failed') {
      this.updateProgress(videoId, 'failed', 'Geração de vídeo cancelada pelo usuário', 0);
      console.log(`[PipelineOrchestrator] Video generation cancelled: ${videoId}`);
    }
  }

  /**
   * Limpa o progresso de um vídeo
   * @param videoId - ID do vídeo
   */
  static clearProgress(videoId: string): void {
    progressMap.delete(videoId);
    console.log(`[PipelineOrchestrator] Progress cleared for video: ${videoId}`);
  }
}
