import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { SortDirection } from '@/types/clan';

interface SortArrowProps {
  direction: SortDirection;
  isActive: boolean;
}

export function SortArrow({ direction, isActive }: SortArrowProps) {
  if (!isActive) {
    return <ChevronsUpDown className="sort-arrow w-4 h-4" />;
  }

  if (direction === 'asc') {
    return <ChevronUp className="sort-arrow active w-4 h-4" />;
  }

  return <ChevronDown className="sort-arrow active w-4 h-4" />;
}
