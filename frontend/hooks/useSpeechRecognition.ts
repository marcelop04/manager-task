import { useState, useRef, useCallback } from "react";

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const hasRecognitionSupport =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const startListening = useCallback(() => {
    if (!hasRecognitionSupport) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    // Detener cualquier reconocimiento previo
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // CONFIGURACIÓN SIMPLIFICADA
    recognitionRef.current.continuous = true; // ✅ Escucha continua
    recognitionRef.current.interimResults = true; // ✅ Resultados en tiempo real
    recognitionRef.current.lang = "es-ES";

    recognitionRef.current.onstart = () => {
      console.log("🎤 Escuchando...");
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + " ";
        } else {
          interimTranscript += transcriptPart;
        }
      }

      // Acumular el texto
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      } else if (interimTranscript) {
        // Mostrar texto temporal mientras hablas
        setTranscript((prev) => {
          const baseText = prev.replace(/\[.*?\]$/g, ""); // Remover texto temporal anterior
          return baseText + " [" + interimTranscript + "]";
        });
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Error:", event.error);
      if (event.error === "not-allowed") {
        alert(
          "Permiso de micrófono denegado. Por favor permite el acceso al micrófono."
        );
      }
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      console.log("⏹️ Reconocimiento terminado");
      setIsListening(false);
      // NO reactivar automáticamente - el usuario controla
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error al iniciar:", error);
      setIsListening(false);
    }
  }, [hasRecognitionSupport]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);

      // Limpiar texto temporal
      setTranscript((prev) => prev.replace(/\[.*?\]$/g, "").trim());
    }
  }, []);

  // Limpiar texto temporal cuando se resetea
  const cleanTranscript = useCallback(() => {
    setTranscript((prev) => prev.replace(/\[.*?\]$/g, "").trim());
  }, []);

  return {
    transcript: transcript.replace(/\[.*?\]$/g, "").trim(), // Texto limpio
    interimTranscript: transcript.match(/\[(.*?)\]$/)?.[1] || "", // Texto temporal actual
    isListening,
    startListening,
    stopListening,
    resetTranscript: () => {
      resetTranscript();
      cleanTranscript();
    },
    hasRecognitionSupport: !!hasRecognitionSupport,
  };
};
