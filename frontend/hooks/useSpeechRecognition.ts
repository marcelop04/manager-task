import { useState, useRef, useCallback } from "react";

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasRecognitionSupport: boolean;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const hasRecognitionSupport =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const startListening = useCallback(() => {
    if (!hasRecognitionSupport) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    // Detener cualquier reconocimiento previo
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    recognitionRef.current = new SpeechRecognition();

    // CONFIGURACIÓN CORREGIDA:
    recognitionRef.current.continuous = false; // Cambiar a FALSE
    recognitionRef.current.interimResults = true; // TRUE para ver resultados mientras hablas
    recognitionRef.current.lang = "es-ES";
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript("");
      console.log("Comenzando a escuchar...");
    };

    recognitionRef.current.onresult = (event: any) => {
      console.log("Resultado recibido:", event.results);

      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      // Mostrar texto mientras se habla
      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      // Cuando termina de hablar
      if (finalTranscript) {
        setTranscript(finalTranscript);
        // NO detener automáticamente, dejar que el usuario decida
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Error de reconocimiento:", event.error);
      setIsListening(false);

      // Reintentar si es un error de red o no speech
      if (event.error === "network" || event.error === "no-speech") {
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 1000);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("Reconocimiento terminado");
      setIsListening(false);

      // Reactivar si aún debería estar escuchando
      if (isListening) {
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 100);
      }
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error al iniciar reconocimiento:", error);
      setIsListening(false);
    }
  }, [hasRecognitionSupport, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
  };
};
