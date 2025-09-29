interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ current, total, className = "" }: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progresso</span>
        <span className="font-medium text-foreground">{percentage}%</span>
      </div>
      <div className="progress-aspect">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Etapa {current} de {total}
      </div>
    </div>
  );
};