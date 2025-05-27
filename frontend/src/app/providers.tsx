"use client";

import { createContext, useContext } from "react";
import { useThemeMode } from "@/hooks/useThemeMode";
import type { Theme } from "@/hooks/useThemeMode";
import { AuthProvider } from "@/context/AuthContext";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: Theme;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const { isDarkMode, toggleDarkMode, theme, mounted } = useThemeMode();

  // Prevent flash of incorrect theme while mounting
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme, mounted }}>
      <AuthProvider>
        <div className={isDarkMode ? "dark" : ""}>{children}</div>
      </AuthProvider>
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
