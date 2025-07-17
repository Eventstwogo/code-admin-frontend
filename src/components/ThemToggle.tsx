'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Avoid hydration mismatch
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background hover:bg-yellow-50 dark:hover:bg-blue-950/30 active:scale-95"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400 drop-shadow" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-blue-600 dark:text-blue-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
