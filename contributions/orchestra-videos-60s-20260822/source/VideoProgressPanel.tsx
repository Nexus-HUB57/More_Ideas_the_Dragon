/**
 * Componente VideoProgressPanel - Painel de Progresso em Tempo Real
 * Exibe o status de cada etapa do pipeline agêntico
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, AlertCircle, Zap, Download } from 'lucide-react';
import '../styles/videoProgressPanel.css';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  percentage: number;
  icon: React.ReactNode;
}

interface VideoProgressPanelProps {
  videoId: string;
  isVisible: boolean;
  onClose?: () => void;
  onDownload?: () => void;
}

const VideoProgressPanel: React.FC<VideoProgressPanelProps> = ({
  videoId,
  isVisible,
  onClose,
  onDownload,
}) => {
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: 'script',
      label: 'Gerando Roteiro',
      status: 'in-progress',
      percentage: 0,
      icon: <Zap size={20} />,
    },
    {
      id: 'images',
      label: 'Gerando Imagens',
      status: 'pending',
      percentage: 0,
      icon: <Zap size={20} />,
    },
    {
      id: 'audio',
      label: 'Sintetizando Narração',
      status: 'pending',
      percentage: 0,
      icon: <Zap size={20} />,
    },
    {
      id: 'composition',
      label: 'Compondo Vídeo',
      status: 'pending',
      percentage: 0,
      icon: <Zap size={20} />,
    },
  ]);

  const [overallProgress, setOverallProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Iniciando pipeline...');
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Simular progresso (será substituído por polling real da API)
  useEffect(() => {
    if (!isVisible) return;

    const progressInterval = setInterval(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        let totalProgress = 0;

        // Simular progresso das etapas
        for (let i = 0; i < newSteps.length; i++) {
          if (newSteps[i].status === 'completed') {
            newSteps[i].percentage = 100;
            totalProgress += 25;
          } else if (newSteps[i].status === 'in-progress') {
            newSteps[i].percentage = Math.min(newSteps[i].percentage + Math.random() * 15, 90);
            totalProgress += (newSteps[i].percentage / 100) * 25;

            // Simular conclusão de etapa
            if (newSteps[i].percentage >= 85 && Math.random() > 0.7) {
              newSteps[i].status = 'completed';
              newSteps[i].percentage = 100;
              totalProgress += 25;

              // Iniciar próxima etapa
              if (i + 1 < newSteps.length) {
                newSteps[i + 1].status = 'in-progress';
              }
            }
          }
        }

        setOverallProgress(Math.min(totalProgress, 95));

        // Simular conclusão
        if (newSteps.every(step => step.status === 'completed')) {
          setOverallProgress(100);
          setIsCompleted(true);
          setCurrentMessage('Vídeo gerado com sucesso! 🎉');
        }

        return newSteps;
      });
    }, 800);

    return () => clearInterval(progressInterval);
  }, [isVisible]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="status-icon completed" size={24} />;
      case 'in-progress':
        return <Clock className="status-icon in-progress" size={24} />;
      case 'failed':
        return <AlertCircle className="status-icon failed" size={24} />;
      default:
        return <Clock className="status-icon pending" size={24} />;
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="video-progress-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="video-progress-panel"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Cabeçalho */}
        <div className="progress-header">
          <h2 className="progress-title">Gerando Seu Vídeo</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {/* Barra de Progresso Geral */}
        <div className="overall-progress-section">
          <div className="progress-percentage">{Math.round(overallProgress)}%</div>
          <div className="progress-bar-container">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="progress-message">{currentMessage}</p>
        </div>

        {/* Etapas do Pipeline */}
        <div className="pipeline-steps">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`pipeline-step ${step.status}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="step-header">
                <div className="step-icon-wrapper">
                  {getStatusIcon(step.status)}
                </div>
                <div className="step-info">
                  <h3 className="step-label">{step.label}</h3>
                  <div className="step-progress-bar">
                    <motion.div
                      className="step-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${step.percentage}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <div className="step-percentage">{Math.round(step.percentage)}%</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Botões de Ação */}
        {isCompleted && (
          <motion.div
            className="progress-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {onDownload && (
              <button className="action-button download-button" onClick={onDownload}>
                <Download size={20} />
                Baixar Vídeo
              </button>
            )}
            {onClose && (
              <button className="action-button close-action-button" onClick={onClose}>
                Fechar
              </button>
            )}
          </motion.div>
        )}

        {hasError && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={20} />
            <span>Erro ao gerar vídeo. Tente novamente.</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VideoProgressPanel;
