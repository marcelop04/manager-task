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

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "es-ES";

    recognitionRef.current.onstart = () => {
      console.log("🎤 Escuchando...");
      setIsListening(true);
      setTranscript(""); // 🔥 LIMPIAR al empezar
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = "";

      // 🔥 SOLO CAPTURAR TEXTOS FINALES, ignorar los temporales
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => {
          // 🔥 SOLO AGREGAR NUEVOS TEXTOS FINALES, sin duplicar
          const cleanPrev = prev.replace(/\[.*?\]/g, "").trim();
          return cleanPrev + " " + finalTranscript.trim();
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
    }
  }, []);

  return {
    transcript: transcript.trim(),
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport: !!hasRecognitionSupport,
  };
};
