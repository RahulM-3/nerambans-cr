import { TrendingUp, TrendingDown } from 'lucide-react';

interface DeltaIndicatorProps {
  value: number;
  showZero?: boolean;
}

export function DeltaIndicator({ value, showZero = false }: DeltaIndicatorProps) {
  if (value === 0 && !showZero) return null;
  
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  return (
    <span 
      className={`inline-flex items-center gap-0.5 ml-1 text-xs font-medium ${
        isPositive 
          ? 'text-emerald-500' 
          : isNegative 
            ? 'text-red-500' 
            : 'text-muted-foreground'
      }`}
    >
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {isPositive && '+'}
      {value}
    </span>
  );
}
