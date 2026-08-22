/**
 * Componente VideoCreator - Interface para criação de vídeos
 * Estilo: Cinemático Neon-Noir com fundo azul meia-noite profundo
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play, Upload, Zap } from 'lucide-react';
import '../styles/videoCreator.css';

interface VideoPrompt {
  theme: string;
  style: string;
  tone: string;
  additionalContext?: string;
}

interface VideoCreatorProps {
  onStartGeneration?: (prompt: VideoPrompt) => void;
}

const VideoCreator: React.FC<VideoCreatorProps> = ({ onStartGeneration }) => {
  const [prompt, setPrompt] = useState<VideoPrompt>({
    theme: '',
    style: '',
    tone: '',
    additionalContext: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPrompt(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar entrada
    if (!prompt.theme.trim() || !prompt.style.trim() || !prompt.tone.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      if (onStartGeneration) {
        await onStartGeneration(prompt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar geração de vídeo');
    } finally {
      setIsLoading(false);
    }
  };

  const presetThemes = ['Ficção Científica', 'Natureza', 'Tecnologia', 'Fantasia', 'Documentário'];
  const presetStyles = ['Cinemático', 'Minimalista', 'Vibrante', 'Noir', 'Futurista'];
  const presetTones = ['Inspirador', 'Misterioso', 'Energético', 'Calmo', 'Épico'];

  return (
    <div className="video-creator-container">
      {/* Fundo animado com gradiente neon */}
      <div className="video-creator-background">
        <div className="neon-grid"></div>
        <div className="neon-glow-1"></div>
        <div className="neon-glow-2"></div>
      </div>

      {/* Conteúdo principal */}
      <motion.div
        className="video-creator-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cabeçalho */}
        <motion.div
          className="video-creator-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="header-icon">
            <Sparkles className="icon-sparkle" size={32} />
          </div>
          <h1 className="video-creator-title">
            Nexus<span className="title-accent"> Video</span> Creator
          </h1>
          <p className="video-creator-subtitle">
            Transforme suas ideias em vídeos de até 60 segundos com IA agêntica
          </p>
        </motion.div>

        {/* Formulário */}
        <motion.form
          className="video-creator-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Campo Tema */}
          <motion.div
            className="form-group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <label htmlFor="theme" className="form-label">
              <span className="label-icon">🎬</span> Tema
            </label>
            <select
              id="theme"
              name="theme"
              value={prompt.theme}
              onChange={handleInputChange}
              className="form-input form-select"
              disabled={isLoading}
            >
              <option value="">Selecione um tema...</option>
              {presetThemes.map(theme => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
            <div className="form-input-border"></div>
          </motion.div>

          {/* Campo Estilo */}
          <motion.div
            className="form-group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <label htmlFor="style" className="form-label">
              <span className="label-icon">🎨</span> Estilo Visual
            </label>
            <select
              id="style"
              name="style"
              value={prompt.style}
              onChange={handleInputChange}
              className="form-input form-select"
              disabled={isLoading}
            >
              <option value="">Selecione um estilo...</option>
              {presetStyles.map(style => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
            <div className="form-input-border"></div>
          </motion.div>

          {/* Campo Tom */}
          <motion.div
            className="form-group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <label htmlFor="tone" className="form-label">
              <span className="label-icon">🎵</span> Tom
            </label>
            <select
              id="tone"
              name="tone"
              value={prompt.tone}
              onChange={handleInputChange}
              className="form-input form-select"
              disabled={isLoading}
            >
              <option value="">Selecione um tom...</option>
              {presetTones.map(tone => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
            <div className="form-input-border"></div>
          </motion.div>

          {/* Campo Contexto Adicional */}
          <motion.div
            className="form-group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <label htmlFor="additionalContext" className="form-label">
              <span className="label-icon">💭</span> Contexto Adicional (Opcional)
            </label>
            <textarea
              id="additionalContext"
              name="additionalContext"
              value={prompt.additionalContext}
              onChange={handleInputChange}
              placeholder="Descreva detalhes adicionais para seu vídeo..."
              className="form-input form-textarea"
              disabled={isLoading}
              rows={4}
            />
            <div className="form-input-border"></div>
          </motion.div>

          {/* Mensagem de Erro */}
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>⚠️ {error}</span>
            </motion.div>
          )}

          {/* Botão de Envio */}
          <motion.button
            type="submit"
            className="submit-button"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="button-content">
              {isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap size={20} />
                  </motion.span>
                  Gerando vídeo...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Gerar Vídeo
                </>
              )}
            </span>
          </motion.button>
        </motion.form>

        {/* Dicas de Uso */}
        <motion.div
          className="video-creator-tips"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="tips-title">💡 Dicas para Melhores Resultados</div>
          <ul className="tips-list">
            <li>Escolha um tema específico para melhor qualidade visual</li>
            <li>O estilo visual define a aparência geral do vídeo</li>
            <li>O tom afeta a narração e a atmosfera geral</li>
            <li>Adicione contexto para personalizações mais precisas</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VideoCreator;
