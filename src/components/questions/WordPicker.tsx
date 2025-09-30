import { useState } from "react";
import { Effect, WordPickerMode } from "@/types/questions";
import { calculateSelectScore, calculateRankScore } from "@/utils/scoring";
import { Button } from "@/components/ui/button";

interface WordPickerProps {
  prompt?: string;
  items: { id: string; text: string; correct?: boolean }[];
  mode: WordPickerMode;
  scoring?: {
    rankWeights?: number[];
    correctEffect?: Effect;
    wrongEffect?: Effect;
  };
  onAnswer: (effect: Effect, detail: { selectedIds?: string[]; rankedIds?: string[] }) => void;
  confirmLabel?: string;
}

export const WordPicker = ({ 
  prompt, 
  items, 
  mode, 
  scoring,
  onAnswer, 
  confirmLabel = "Confirmar" 
}: WordPickerProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rankedIds, setRankedIds] = useState<string[]>(items.map(item => item.id));
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = rankedIds.indexOf(draggedId);
    const targetIndex = rankedIds.indexOf(targetId);

    const newRanked = [...rankedIds];
    newRanked.splice(draggedIndex, 1);
    newRanked.splice(targetIndex, 0, draggedId);
    setRankedIds(newRanked);
  };

  const handleConfirm = () => {
    if (!scoring?.correctEffect || !scoring?.wrongEffect) {
      onAnswer({}, mode === "select" ? { selectedIds } : { rankedIds });
      return;
    }

    let effect: Effect;
    if (mode === "select") {
      effect = calculateSelectScore(selectedIds, items, scoring.correctEffect, scoring.wrongEffect);
      onAnswer(effect, { selectedIds });
    } else {
      effect = calculateRankScore(
        rankedIds, 
        scoring.rankWeights || [4, 3, 2, 1], 
        scoring.correctEffect, 
        scoring.wrongEffect
      );
      onAnswer(effect, { rankedIds });
    }
  };

  return (
    <div className="space-y-6">
      {prompt && (
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          {prompt}
        </h2>
      )}

      <div className="space-y-3">
        {mode === "select" ? (
          // Modo Select: clique para selecionar
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleToggleSelect(item.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedIds.includes(item.id)
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card hover:border-primary/50 text-foreground'
              }`}
              role="checkbox"
              aria-checked={selectedIds.includes(item.id)}
            >
              <span className="font-medium">{item.text}</span>
            </button>
          ))
        ) : (
          // Modo Rank: drag & drop para ordenar
          rankedIds.map((id, index) => {
            const item = items.find(i => i.id === id);
            if (!item) return null;
            
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-card cursor-move hover:border-primary/50 transition-all"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span className="font-medium text-foreground">{item.text}</span>
              </div>
            );
          })
        )}
      </div>

      <Button 
        onClick={handleConfirm}
        className="w-full"
        size="lg"
      >
        {confirmLabel}
      </Button>
    </div>
  );
};
