import React from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface VoiceTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

export const VoiceTaskModal: React.FC<VoiceTaskModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  const handleRepeat = () => {
    resetTranscript();
    startListening();
  };

  const handleAccept = () => {
    if (transcript.trim()) {
      onConfirm(transcript);
      resetTranscript();
    }
  };

  const handleClose = () => {
    resetTranscript();
    onClose();
  };

  if (!isOpen) return null;

  if (!hasRecognitionSupport) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Crear Tarea por Voz</h2>
          <div className="modal-content">
            <p>Tu navegador no soporta reconocimiento de voz.</p>
            <p>Por favor, usa Chrome, Edge o Safari.</p>
          </div>
          <div className="modal-actions">
            <button onClick={handleClose} className="btn btn-secondary">
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal voice-modal">
        <h2>Crear Tarea por Voz</h2>

        <div className="modal-content">
          <div className="voice-status">
            {isListening ? (
              <div className="listening-indicator">
                <div className="pulse"></div>
                <span>Escuchando... Habla ahora</span>
              </div>
            ) : (
              <div className="idle-state">
                <span>Presiona "Comenzar" para hablar</span>
              </div>
            )}
          </div>

          <div className="transcript-container">
            <label>Texto reconocido:</label>
            <div className="transcript">
              {transcript ||
                (isListening
                  ? "Escuchando..."
                  : 'Presiona "Comenzar" para hablar')}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={handleClose} className="btn btn-secondary">
            Volver
          </button>

          {!isListening ? (
            <button onClick={startListening} className="btn btn-primary">
              🎤 Comenzar
            </button>
          ) : (
            <button onClick={stopListening} className="btn btn-secondary">
              ⏹️ Detener
            </button>
          )}

          {transcript && !isListening && (
            <>
              <button onClick={handleRepeat} className="btn btn-secondary">
                🔄 Repetir
              </button>
              <button onClick={handleAccept} className="btn btn-primary">
                ✅ Aceptar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
