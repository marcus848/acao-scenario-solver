import { AspectKey } from "@/config/simulador";

interface AspectCardProps {
  label: string;
  value: number;
  aspectKey: AspectKey;
}

export const AspectCard = ({ label, value, aspectKey }: AspectCardProps) => {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div className="card-simulator p-4 flex-1 min-w-0">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm lg:text-base truncate">
            {label}
          </h3>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap ml-2">
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
    </div>
  );
};
