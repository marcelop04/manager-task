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

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleAccept = () => {
    const finalText = transcript.trim();
    if (finalText) {
      onConfirm(finalText);
    } else {
      alert(
        "No se detectó ningún texto. Por favor, habla más claro o presiona '🎤 Comenzar a Grabar' nuevamente."
      );
    }
  };

  const handleClose = () => {
    if (isListening) {
      stopListening();
    }
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
            <p>🚫 Tu navegador no soporta reconocimiento de voz.</p>
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
        <h2>🎤 Crear Tarea por Voz</h2>

        <div className="modal-content">
          <div className="voice-status">
            {isListening ? (
              <div className="listening-indicator">
                <div className="pulse"></div>
                <span>🎤 Escuchando... Habla ahora</span>
                <small>Presiona "🛑 Parar" cuando termines</small>
              </div>
            ) : (
              <div className="idle-state">
                <span>Presiona "🎤 Comenzar" para hablar</span>
              </div>
            )}
          </div>

          <div className="transcript-container">
            <label>Texto reconocido:</label>
            <div className="transcript">
              {transcript || "Aquí aparecerá tu tarea..."}
            </div>
          </div>

          {transcript && (
            <div className="transcript-preview">
              <strong>Vista previa:</strong>
              <div className="preview-text">{transcript}</div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={handleClose} className="btn btn-secondary">
            Cancelar
          </button>

          <button
            onClick={handleToggleListening}
            className={`btn ${isListening ? "btn-stop" : "btn-primary"}`}
            style={{
              backgroundColor: isListening ? "#e53e3e" : "",
              color: "white",
            }}
          >
            {isListening ? <>🛑 Parar Grabación</> : <>🎤 Comenzar a Grabar</>}
          </button>

          {transcript && !isListening && (
            <button onClick={handleAccept} className="btn btn-success">
              ✅ Crear Tarea
            </button>
          )}
        </div>

        <div className="voice-instructions">
          <p>
            <strong>Instrucciones:</strong>
          </p>
          <ol>
            <li>Presiona "🎤 Comenzar a Grabar"</li>
            <li>Habla claramente tu tarea</li>
            <li>Presiona "🛑 Parar Grabación" cuando termines</li>
            <li>Revisa el texto y presiona "✅ Crear Tarea"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
