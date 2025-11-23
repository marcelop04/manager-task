import { useState, useRef, useCallback, useEffect } from "react";

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isManualStop = useRef(false); // 🔥 NUEVO: controlar parada manual

  const hasRecognitionSupport =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const startListening = useCallback(() => {
    if (!hasRecognitionSupport) {
      console.error("Speech recognition not supported");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    // Detener cualquier instancia previa
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true; // ✅ Mantener en true
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "es-ES";

    recognitionRef.current.onstart = () => {
      console.log("Started listening...");
      setIsListening(true);
      isManualStop.current = false; // 🔥 Resetear bandera
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + " ";
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);

      // 🔥 SOLUCIÓN: Solo reactivar si NO fue una parada manual
      if (!isManualStop.current) {
        console.log("Reactivando...");
        setTimeout(() => {
          if (recognitionRef.current && !isManualStop.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error("Error reactivating:", error);
            }
          }
        }, 100);
      }
    };

    try {
      isManualStop.current = false; // 🔥 Importantísimo
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
    }
  }, [hasRecognitionSupport]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      isManualStop.current = true; // 🔥 Marcar como parada manual
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Limpiar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        isManualStop.current = true;
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport: !!hasRecognitionSupport,
  };
};
