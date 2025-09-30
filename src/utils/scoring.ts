import { Effect, Score } from "@/types/questions";

export function calculateSelectScore(
  selectedIds: string[],
  items: { id: string; correct?: boolean }[],
  correctEffect: Effect,
  wrongEffect: Effect
): Effect {
  const correctItems = items.filter(item => item.correct);
  const totalCorrect = correctItems.length;
  const selectedCorrect = selectedIds.filter(id => 
    items.find(item => item.id === id)?.correct
  ).length;
  
  const accuracy = totalCorrect > 0 ? selectedCorrect / totalCorrect : 0;
  
  return accuracy >= 0.7 ? correctEffect : wrongEffect;
}

export function calculateRankScore(
  rankedIds: string[],
  rankWeights: number[],
  correctEffect: Effect,
  wrongEffect: Effect
): Effect {
  // Calcula score baseado nos pesos de posição
  let totalScore = 0;
  let maxScore = 0;
  
  rankWeights.forEach((weight, index) => {
    maxScore += weight;
    if (index < rankedIds.length) {
      totalScore += weight;
    }
  });
  
  const normalizedScore = maxScore > 0 ? totalScore / maxScore : 0;
  
  return normalizedScore >= 0.7 ? correctEffect : wrongEffect;
}
