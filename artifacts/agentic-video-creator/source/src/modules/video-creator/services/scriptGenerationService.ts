/**
 * Serviço de Geração de Roteiro via LLM
 * Utiliza o Google GenAI (Gemini) ou Claude para gerar roteiros estruturados
 */

import { VideoPrompt, VideoScript, Scene, ScriptGenerationResult } from '../types/index';

const SCRIPT_GENERATION_PROMPT_TEMPLATE = `
You are a professional video scriptwriter specializing in creating engaging video content.

Given the following user prompt, generate a detailed video script with the following requirements:
1. The script should be structured into scenes (3-6 scenes maximum)
2. Each scene should have:
   - A unique scene ID (scene_1, scene_2, etc.)
   - Narration text (2-4 sentences, clear and engaging)
   - Visual description (detailed description for image generation, 1-2 sentences)
   - Estimated duration (3-15 seconds per scene)
3. Total video duration should not exceed 60 seconds
4. The script should follow the theme, style, and tone specified
5. Output MUST be valid JSON

User Prompt:
Theme: {theme}
Style: {style}
Tone: {tone}
Additional Context: {additionalContext}

Generate a JSON object with the following structure:
{
  "scenes": [
    {
      "sceneId": "scene_1",
      "sceneIndex": 0,
      "narrationText": "...",
      "visualDescription": "...",
      "duration": 10
    }
  ],
  "totalDuration": 60
}

IMPORTANT: Return ONLY the JSON object, no additional text.
`;

export class ScriptGenerationService {
  /**
   * Gera um roteiro estruturado a partir de um prompt do usuário
   * @param videoId - ID único do vídeo
   * @param prompt - Prompt do usuário com tema, estilo e tom
   * @returns Promise<ScriptGenerationResult>
   */
  static async generateScript(
    videoId: string,
    prompt: VideoPrompt
  ): Promise<ScriptGenerationResult> {
    try {
      // Validar entrada
      if (!prompt.theme || !prompt.style || !prompt.tone) {
        throw new Error('Missing required prompt fields: theme, style, or tone');
      }

      // Preparar o prompt para o LLM
      const llmPrompt = SCRIPT_GENERATION_PROMPT_TEMPLATE
        .replace('{theme}', prompt.theme)
        .replace('{style}', prompt.style)
        .replace('{tone}', prompt.tone)
        .replace('{additionalContext}', prompt.additionalContext || 'None');

      // Chamar o LLM (será implementado com a integração real do Gemini/Claude)
      const scriptJson = await this.callLLM(llmPrompt);

      // Parsear a resposta JSON
      const parsedScript = JSON.parse(scriptJson);

      // Validar a estrutura do script
      if (!parsedScript.scenes || !Array.isArray(parsedScript.scenes)) {
        throw new Error('Invalid script structure: missing scenes array');
      }

      // Construir o objeto VideoScript
      const videoScript: VideoScript = {
        videoId,
        prompt,
        scenes: parsedScript.scenes.map((scene: any, index: number) => ({
          sceneId: scene.sceneId || `scene_${index + 1}`,
          sceneIndex: index,
          narrationText: scene.narrationText,
          visualDescription: scene.visualDescription,
          duration: Math.min(scene.duration, 15), // Máximo 15 segundos por cena
        })),
        totalDuration: parsedScript.totalDuration || 60,
        generatedAt: new Date(),
      };

      // Validar duração total
      const actualTotalDuration = videoScript.scenes.reduce(
        (sum, scene) => sum + scene.duration,
        0
      );
      if (actualTotalDuration > 60) {
        // Ajustar durações proporcionalmente
        const scaleFactor = 60 / actualTotalDuration;
        videoScript.scenes = videoScript.scenes.map(scene => ({
          ...scene,
          duration: Math.max(3, Math.floor(scene.duration * scaleFactor)),
        }));
      }

      return {
        success: true,
        data: videoScript,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[ScriptGenerationService] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during script generation',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Chama o LLM para gerar o roteiro
   * Esta é uma implementação placeholder que será substituída pela integração real
   * @param prompt - Prompt para o LLM
   * @returns Promise<string> - Resposta JSON do LLM
   */
  private static async callLLM(prompt: string): Promise<string> {
    // TODO: Integrar com o Google GenAI (Gemini) ou Claude
    // Por enquanto, retornar um exemplo de resposta estruturada para testes

    // Simulação de chamada ao LLM
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular latência

    // Exemplo de resposta estruturada
    const exampleResponse = {
      scenes: [
        {
          sceneId: 'scene_1',
          narrationText: 'Welcome to an incredible journey through innovation and creativity.',
          visualDescription: 'Futuristic cityscape with neon lights, flying vehicles, and holographic displays',
          duration: 12,
        },
        {
          sceneId: 'scene_2',
          narrationText: 'Discover the power of artificial intelligence transforming the world.',
          visualDescription: 'Close-up of AI neural networks, data streams, and digital transformations',
          duration: 15,
        },
        {
          sceneId: 'scene_3',
          narrationText: 'Join us in creating the future, today.',
          visualDescription: 'Sunset over a digital landscape with glowing particles and cosmic elements',
          duration: 10,
        },
      ],
      totalDuration: 37,
    };

    return JSON.stringify(exampleResponse);
  }
}
