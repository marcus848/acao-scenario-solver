import { Score, CONFIG } from "@/config/simulador";
import { AspectCard } from "./AspectCard";

interface AspectCardsProps {
  score: Score;
}

export const AspectCards = ({ score }: AspectCardsProps) => {
  return (
    <div className="w-full">
      {/* Desktop: 3 cards lado a lado */}
      <div className="hidden lg:flex flex-wrap gap-4 justify-center">
        {CONFIG.aspects.map(({ key, label }) => (
          <AspectCard
            key={key}
            label={label}
            value={score[key]}
            aspectKey={key}
          />
        ))}
      </div>

      {/* Mobile/Tablet: 1 card único com os 3 aspectos */}
      <div className="lg:hidden">
        <div className="card-simulator p-4">
          <div className="space-y-4">
            {CONFIG.aspects.map(({ key, label }) => {
              const value = score[key];
              const percentage = Math.max(0, Math.min(100, value));
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">
                      {label}
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground">
                      {Math.round(value)} / 100
                    </span>
                  </div>
                  <div className="progress-aspect">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
