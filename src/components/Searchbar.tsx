// components/ui/search-bar.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRef } from 'react';

export function SearchBarWithIcon({
  placeholder = 'Search...',
  onChange,
  value,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  // Debounce input changes
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange?.(val);
    }, 300); // 300ms debounce
  };

  return (
    <div className="relative w-full md:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  );
}
