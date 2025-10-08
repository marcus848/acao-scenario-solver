import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export interface RatingItem {
  label: string;
  key: string;
}

export interface RatingQuestionProps {
  title: string;
  items: RatingItem[];
  min?: number;
  max?: number;
  step?: number;
  onSubmit: (ratings: Record<string, number>) => void;
}

export const RatingQuestion = ({
  title,
  items,
  min = 0,
  max = 10,
  step = 1,
  onSubmit,
}: RatingQuestionProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({ ...acc, [item.key]: min }), {})
  );

  const handleRatingChange = (key: string, value: number[]) => {
    setRatings((prev) => ({ ...prev, [key]: value[0] }));
  };

  const handleSubmit = () => {
    onSubmit(ratings);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center">
        {title}
      </h2>
      
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.key} className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm md:text-base font-medium text-foreground">
                {item.label}
              </label>
              <span className="text-lg font-bold text-primary min-w-[3rem] text-right">
                {ratings[item.key]}
              </span>
            </div>
            <Slider
              value={[ratings[item.key]]}
              onValueChange={(value) => handleRatingChange(item.key, value)}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} className="w-full mt-6">
        Confirmar Avaliação
      </Button>
    </div>
  );
};
