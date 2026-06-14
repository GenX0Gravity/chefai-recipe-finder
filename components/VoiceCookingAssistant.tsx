"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, SkipForward, SkipBack, Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceCookingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
  instructions: string[];
}

export default function VoiceCookingAssistant({
  isOpen,
  onClose,
  recipeTitle,
  instructions,
}: VoiceCookingAssistantProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const currentStepRef = useRef(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null); 
  const isComponentMounted = useRef(true);

  // Sync state to ref for stale closures
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // Open/Close effect
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      // Wait for state to update
      setTimeout(() => {
        readStep(0);
      }, 0);
    } else {
      stopEverything();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Initialize Web Speech API
  useEffect(() => {
    isComponentMounted.current = true;
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onresult = (event: any) => {
          const lastResultIndex = event.results.length - 1;
          const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
          
          console.log("Heard:", transcript);
          handleVoiceCommand(transcript);
        };

        recognitionRef.current.onstart = () => {
          if (isComponentMounted.current) setIsListening(true);
        };

        recognitionRef.current.onend = () => {
          if (isComponentMounted.current && isOpen && !synthRef.current?.speaking) {
            try {
              recognitionRef.current?.start();
            } catch {
              // Ignore
            }
          } else {
            if (isComponentMounted.current) setIsListening(false);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === 'not-allowed') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRecognitionError("Microphone access denied. Voice commands disabled.");
          }
        };
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecognitionError("Voice commands are not supported in this browser.");
      }
    }

    return () => {
      isComponentMounted.current = false;
      stopEverything();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  function handleVoiceCommand(transcript: string) {
    if (transcript.includes("next step") || transcript.includes("next")) {
      goToNext();
    } else if (
      transcript.includes("previous step") ||
      transcript.includes("go back") ||
      transcript.includes("previous")
    ) {
      goToPrevious();
    } else if (transcript.includes("repeat") || transcript.includes("say again")) {
      readStep(currentStepRef.current);
    } else if (transcript.includes("pause") || transcript.includes("stop")) {
      pauseReading();
    } else if (transcript.includes("play") || transcript.includes("resume") || transcript.includes("start")) {
      resumeReading();
    }
  }

  function stopEverything() {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsPlaying(false);
    setIsListening(false);
  }

  function startListening() {
    if (recognitionRef.current && !synthRef.current?.speaking) {
      try {
        recognitionRef.current.start();
      } catch {
        // Ignore
      }
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
  }

  function readStep(stepIndex: number) {
    if (!synthRef.current || !instructions[stepIndex]) return;

    stopEverything();

    const textToRead = `Step ${stepIndex + 1}. ${instructions[stepIndex]}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);

    utterance.onstart = () => {
      if (isComponentMounted.current) setIsPlaying(true);
    };

    utterance.onend = () => {
      if (isComponentMounted.current) {
        setIsPlaying(false);
        startListening();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    utterance.onerror = (e: any) => {
      console.error("Speech synthesis error", e);
      if (isComponentMounted.current) setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
  }

  function pauseReading() {
    if (synthRef.current?.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPlaying(false);
      startListening(); 
    }
  }

  function resumeReading() {
    if (synthRef.current?.paused) {
      stopListening(); 
      synthRef.current.resume();
      setIsPlaying(true);
    } else if (!synthRef.current?.speaking) {
      readStep(currentStepRef.current);
    }
  }

  function togglePlayPause() {
    if (isPlaying) {
      pauseReading();
    } else {
      resumeReading();
    }
  }

  function goToNext() {
    const step = currentStepRef.current;
    if (step < instructions.length - 1) {
      const nextStep = step + 1;
      setCurrentStep(nextStep);
      readStep(nextStep);
    }
  }

  function goToPrevious() {
    const step = currentStepRef.current;
    if (step > 0) {
      const prevStep = step - 1;
      setCurrentStep(prevStep);
      readStep(prevStep);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-white sm:p-4">
      <div className="flex items-center justify-between p-4 bg-slate-800 sm:rounded-t-2xl border-b border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-amber-500 truncate pr-4">{recipeTitle}</h2>
          <p className="text-sm text-slate-400">Cooking Assistant</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
          aria-label="Close Assistant"
        >
          <X className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center">
        <div className="max-w-2xl w-full">
          <div className="mb-6 flex justify-between items-end">
            <span className="text-amber-500 font-bold tracking-wider uppercase">
              Step {currentStep + 1} of {instructions.length}
            </span>
            
            <div className="flex items-center text-sm font-medium">
              {isPlaying ? (
                <span className="flex items-center text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                  <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                  Reading...
                </span>
              ) : isListening ? (
                <span className="flex items-center text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                  <Mic className="w-4 h-4 mr-2 animate-pulse" />
                  Listening...
                </span>
              ) : (
                <span className="flex items-center text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  <MicOff className="w-4 h-4 mr-2" />
                  Paused
                </span>
              )}
            </div>
          </div>

          <p className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight sm:leading-snug md:leading-snug text-slate-100">
            {instructions[currentStep]}
          </p>

          {recognitionError && (
            <div className="mt-8 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {recognitionError}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-800/50 text-center text-sm text-slate-400 border-t border-slate-800">
        <p>Try saying: <span className="text-amber-400 font-medium">&quot;Next step&quot;</span>, <span className="text-amber-400 font-medium">&quot;Previous step&quot;</span>, <span className="text-amber-400 font-medium">&quot;Repeat&quot;</span>, or <span className="text-amber-400 font-medium">&quot;Pause&quot;</span>.</p>
      </div>

      <div className="p-6 bg-slate-800 sm:rounded-b-2xl border-t border-slate-700 flex justify-center items-center space-x-6 pb-safe">
        <button
          onClick={goToPrevious}
          disabled={currentStep === 0}
          className="p-4 rounded-full bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
          aria-label="Previous Step"
        >
          <SkipBack className="w-8 h-8" />
        </button>

        <button
          onClick={togglePlayPause}
          className="p-6 rounded-full bg-amber-500 text-amber-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-10 h-10 fill-current" />
          ) : (
            <Play className="w-10 h-10 fill-current" />
          )}
        </button>

        <button
          onClick={goToNext}
          disabled={currentStep === instructions.length - 1}
          className="p-4 rounded-full bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
          aria-label="Next Step"
        >
          <SkipForward className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
