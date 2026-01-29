import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLE_DISPLAY } from '@/types/clan';

interface RoleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function RoleFilter({ value, onChange }: RoleFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-7 w-full bg-secondary/50 border-border text-xs">
        <SelectValue placeholder="All Roles" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        <SelectItem value="all">All Roles</SelectItem>
        {Object.entries(ROLE_DISPLAY).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
