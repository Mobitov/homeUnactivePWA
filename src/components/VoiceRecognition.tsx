"use client";

import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionProps {
  onResult: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  language?: string;
  continuous?: boolean;
  className?: string;
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  onResult,
  onFinalResult,
  language = 'fr-FR',
  continuous = false,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  // Add type declarations for the Web Speech API
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if browser supports SpeechRecognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setSupported(false);
        setError("La reconnaissance vocale n'est pas supportée par votre navigateur.");
        return;
      }
      
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = language;
      recognitionInstance.continuous = continuous;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        onResult(transcript);
        
        // Check if result is final
        const isFinal = event.results[0].isFinal;
        if (isFinal && onFinalResult) {
          onFinalResult(transcript);
          if (!continuous) {
            setIsListening(false);
          }
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError(`Erreur: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        if (isListening && continuous) {
          recognitionInstance.start();
        } else {
          setIsListening(false);
        }
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language, continuous, onResult, onFinalResult]);

  const toggleListening = useCallback(() => {
    if (!supported) {
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition', err);
        setError("Impossible de démarrer la reconnaissance vocale.");
      }
    }
  }, [isListening, recognition, supported]);

  return (
    <div className={`voice-recognition ${className}`}>
      {supported ? (
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center p-3 rounded-full transition-colors duration-200 ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          aria-label={isListening ? "Arrêter l'enregistrement vocal" : "Démarrer l'enregistrement vocal"}
          title={isListening ? "Arrêter l'enregistrement vocal" : "Démarrer l'enregistrement vocal"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isListening
                  ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              }
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="flex items-center justify-center p-3 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
          title="La reconnaissance vocale n'est pas supportée par votre navigateur"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </button>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      {isListening && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Écoute en cours...
        </div>
      )}
    </div>
  );
};

export default VoiceRecognition;
