import { useState, useEffect, useCallback } from "react";
import { Score, CONFIG, clamp } from "@/config/simulador";

const STORAGE_KEY = "acao_scores";

const getInitialScores = (): Score => {
  if (typeof window === "undefined") return CONFIG.initial;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return CONFIG.initial;
    }
  }
  return CONFIG.initial;
};

export const useScores = () => {
  const [score, setScore] = useState<Score>(getInitialScores);

  // Sync with localStorage on mount and when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setScore(JSON.parse(stored));
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const applyEffect = useCallback((effect: Partial<Score>) => {
    setScore((prev) => {
      const updated: Score = {
        pessoas: clamp(prev.pessoas + (effect.pessoas || 0)),
        atitudes: clamp(prev.atitudes + (effect.atitudes || 0)),
        negocio: clamp(prev.negocio + (effect.negocio || 0)),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetScores = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG.initial));
    setScore(CONFIG.initial);
  }, []);

  return { score, applyEffect, resetScores };
};

// Utility to get scores from localStorage (for non-hook contexts)
export const getStoredScores = (): Score => {
  if (typeof window === "undefined") return CONFIG.initial;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return CONFIG.initial;
    }
  }
  return CONFIG.initial;
};
