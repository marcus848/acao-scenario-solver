import { useState, useEffect, useCallback } from "react";
import { Score, CONFIG, clamp } from "@/config/simulador";
import { fetchAndCalculateGroupScore, getUnitEventData, getGroupData } from "@/lib/api";

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
  const [loading, setLoading] = useState(false);

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

  // Set score directly (from backend)
  const setScoreFromBackend = useCallback((newScore: Score) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newScore));
    setScore(newScore);
  }, []);

  // Fetch score from backend and update state
  const refreshGroupScore = useCallback(async (): Promise<Score> => {
    const unitEventData = getUnitEventData();
    const groupData = getGroupData();

    if (!unitEventData.eventId || !unitEventData.unitId || !groupData.groupId) {
      console.warn("Dados insuficientes para buscar score do grupo");
      return CONFIG.initial;
    }

    setLoading(true);
    try {
      const calculatedScore = await fetchAndCalculateGroupScore(
        Number(unitEventData.eventId),
        Number(unitEventData.unitId),
        Number(groupData.groupId)
      );
      
      setScoreFromBackend(calculatedScore);
      return calculatedScore;
    } catch (error) {
      console.error("Erro ao atualizar score do grupo:", error);
      return CONFIG.initial;
    } finally {
      setLoading(false);
    }
  }, [setScoreFromBackend]);

  return { score, applyEffect, resetScores, setScoreFromBackend, refreshGroupScore, loading };
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
