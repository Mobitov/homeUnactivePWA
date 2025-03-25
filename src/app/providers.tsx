"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to apply all dark mode CSS variables
  const applyDarkModeVariables = () => {
    document.documentElement.style.setProperty('--background', '#0a0a0a');
    document.documentElement.style.setProperty('--foreground', '#ededed');
    document.documentElement.style.setProperty('--card-bg', '#1f2937');
    document.documentElement.style.setProperty('--card-border', '#374151');
    document.documentElement.style.setProperty('--primary', '#60a5fa');
    document.documentElement.style.setProperty('--primary-hover', '#3b82f6');
    document.documentElement.style.setProperty('--text-primary', '#f9fafb');
    document.documentElement.style.setProperty('--text-secondary', '#e5e7eb');
    document.documentElement.style.setProperty('--text-tertiary', '#9ca3af');
    document.documentElement.style.setProperty('--link-color', '#60a5fa');
  };

  // Function to apply all light mode CSS variables
  const applyLightModeVariables = () => {
    document.documentElement.style.setProperty('--background', '#f3f4f6'); // Changed to light grey
    document.documentElement.style.setProperty('--foreground', '#171717');
    document.documentElement.style.setProperty('--card-bg', '#ffffff'); // Card background remains white for contrast
    document.documentElement.style.setProperty('--card-border', '#e5e7eb');
    document.documentElement.style.setProperty('--primary', '#4299e1');
    document.documentElement.style.setProperty('--primary-hover', '#3182ce');
    document.documentElement.style.setProperty('--text-primary', '#171717');
    document.documentElement.style.setProperty('--text-secondary', '#4b5563');
    document.documentElement.style.setProperty('--text-tertiary', '#6b7280');
    document.documentElement.style.setProperty('--link-color', '#3182ce');
  };

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;
    
    // Check user preference from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      applyDarkModeVariables();
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
      applyLightModeVariables();
    }

    // Add listener for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        if (e.matches) {
          setIsDarkMode(true);
          document.documentElement.classList.add("dark");
          applyDarkModeVariables();
        } else {
          setIsDarkMode(false);
          document.documentElement.classList.remove("dark");
          applyLightModeVariables();
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        // Switch to dark mode
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        
        // Update all CSS variables for dark mode
        document.documentElement.style.setProperty('--background', '#0a0a0a');
        document.documentElement.style.setProperty('--foreground', '#ededed');
        document.documentElement.style.setProperty('--card-bg', '#1f2937');
        document.documentElement.style.setProperty('--card-border', '#374151');
        document.documentElement.style.setProperty('--primary', '#60a5fa');
        document.documentElement.style.setProperty('--primary-hover', '#3b82f6');
        document.documentElement.style.setProperty('--text-primary', '#f9fafb');
        document.documentElement.style.setProperty('--text-secondary', '#e5e7eb');
        document.documentElement.style.setProperty('--text-tertiary', '#9ca3af');
        document.documentElement.style.setProperty('--link-color', '#60a5fa');
      } else {
        // Switch to light mode
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        
        // Update all CSS variables for light mode
        document.documentElement.style.setProperty('--background', '#f3f4f6'); // Changed to light grey
        document.documentElement.style.setProperty('--foreground', '#171717');
        document.documentElement.style.setProperty('--card-bg', '#ffffff'); // Card background remains white for contrast
        document.documentElement.style.setProperty('--card-border', '#e5e7eb');
        document.documentElement.style.setProperty('--primary', '#4299e1');
        document.documentElement.style.setProperty('--primary-hover', '#3182ce');
        document.documentElement.style.setProperty('--text-primary', '#171717');
        document.documentElement.style.setProperty('--text-secondary', '#4b5563');
        document.documentElement.style.setProperty('--text-tertiary', '#6b7280');
        document.documentElement.style.setProperty('--link-color', '#3182ce');
      }
      
      // Force a repaint to ensure all styles are applied correctly
      const bodyElement = document.body;
      bodyElement.style.display = 'none';
      // This triggers a reflow
      void bodyElement.offsetHeight;
      bodyElement.style.display = '';
      
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
