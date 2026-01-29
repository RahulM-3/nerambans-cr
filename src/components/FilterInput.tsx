import { ChangeEvent } from 'react';

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: 'text' | 'number';
}

export function FilterInput({ value, onChange, placeholder, type = 'text' }: FilterInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="filter-input"
    />
  );
}
