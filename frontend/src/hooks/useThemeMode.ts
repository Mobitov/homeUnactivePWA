import { useEffect, useState } from 'react';
import { lightTheme, darkTheme } from '@/theme/config';

export type Theme = typeof lightTheme;

export const useThemeMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Apply theme variables to document root
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(cssVar, value);
    });
  };

  // Handle theme toggle
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (typeof window !== 'undefined') {
        // Update localStorage
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        // Update class and variables
        document.documentElement.classList.toggle('dark', newMode);
        applyTheme(newMode ? darkTheme : lightTheme);
        // Force a repaint to ensure smooth transition
        document.body.style.display = 'none';
        void document.body.offsetHeight;
        document.body.style.display = '';
      }
      return newMode;
    });
  };

  // Initialize theme
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    // Get initial theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);

    // Apply initial theme
    setIsDarkMode(initialDarkMode);
    document.documentElement.classList.toggle('dark', initialDarkMode);
    applyTheme(initialDarkMode ? darkTheme : lightTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
        applyTheme(e.matches ? darkTheme : lightTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    isDarkMode,
    toggleDarkMode,
    mounted,
    theme: isDarkMode ? darkTheme : lightTheme,
  };
};
