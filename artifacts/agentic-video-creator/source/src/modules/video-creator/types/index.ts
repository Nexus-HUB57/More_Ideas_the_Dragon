/**
 * Tipos TypeScript para o módulo de criação de vídeos
 * Estrutura de dados para o pipeline agêntico de geração de vídeos
 */

export type VideoStatus =
  | 'pending'
  | 'script_generated'
  | 'images_generated'
  | 'audio_generated'
  | 'composing'
  | 'completed'
  | 'failed';

export interface VideoPrompt {
  theme: string;
  style: string;
  tone: string;
  additionalContext?: string;
}

export interface Scene {
  sceneId: string;
  sceneIndex: number;
  narrationText: string;
  visualDescription: string;
  duration: number;
  imageUrl?: string;
  audioUrl?: string;
}

export interface VideoScript {
  videoId: string;
  prompt: VideoPrompt;
  scenes: Scene[];
  totalDuration: number;
  generatedAt: Date;
}

export interface VideoGenerationRequest {
  prompt: VideoPrompt;
  maxDuration: number;
  userId: string;
}

export interface VideoGenerationProgress {
  videoId: string;
  status: VideoStatus;
  currentStep: string;
  progress: number; // 0-100
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface VideoMetadata {
  id: string;
  userId: string;
  prompt: VideoPrompt;
  status: VideoStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  duration?: number;
  sceneCount?: number;
}

export interface PipelineStepResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface ScriptGenerationResult extends PipelineStepResult {
  data?: VideoScript;
}

export interface ImageGenerationResult extends PipelineStepResult {
  data?: {
    sceneId: string;
    imageUrl: string;
  }[];
}

export interface AudioGenerationResult extends PipelineStepResult {
  data?: {
    sceneId: string;
    audioUrl: string;
  }[];
}

export interface VideoCompositionResult extends PipelineStepResult {
  data?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  };
}
