import { Score, CONFIG } from "@/config/simulador";
import { AspectCard } from "./AspectCard";

interface AspectCardsProps {
  score: Score;
}

export const AspectCards = ({ score }: AspectCardsProps) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 justify-center">
        {CONFIG.aspects.map(({ key, label }) => (
          <AspectCard
            key={key}
            label={label}
            value={score[key]}
            aspectKey={key}
          />
        ))}
      </div>
    </div>
  );
};
