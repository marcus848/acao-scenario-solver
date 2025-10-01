import { useState } from "react";
import { Check } from "lucide-react";
import { Score } from "@/config/simulador";

interface Word {
  id: string;
  text: string;
  points?: number; // legado
  effectByAspect?: Partial<Score>; // preferir este
}

interface WordSelection2Props {
  title: string;
  description?: string;
  words: Word[];
  maxSelections?: number;
  onComplete: (selectedIds: string[]) => void;
}

export const WordSelection2 = ({ 
  title, 
  description, 
  words, 
  maxSelections = 5,
  onComplete 
}: WordSelection2Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleWord = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= maxSelections) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    onComplete(selectedIds);
  };

  const isMaxed = selectedIds.length >= maxSelections;

  return (
    <div className="card-simulator p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
          <p className="text-sm text-muted-foreground">
            Selecione até {maxSelections} palavras ({selectedIds.length}/{maxSelections})
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {words.map((word) => {
            const isSelected = selectedIds.includes(word.id);
            const canSelect = !isMaxed || isSelected;

            return (
              <button
                key={word.id}
                onClick={() => canSelect && toggleWord(word.id)}
                disabled={!canSelect}
                className={`
                  relative p-3 rounded-lg border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-card/40 text-foreground hover:border-primary/50'
                  }
                  ${!canSelect && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                `}
                aria-pressed={isSelected}
              >
                <span className="text-sm font-medium">{word.text}</span>
                {isSelected && (
                  <Check className="absolute top-1 right-1 h-4 w-4" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold
                     hover:bg-primary/90 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
};