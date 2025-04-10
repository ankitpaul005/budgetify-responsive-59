
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system" | "classic";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "budgetify-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all existing theme classes
    root.classList.remove("light", "dark", "system", "classic");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      
      root.classList.add(systemTheme);
      return;
    }
    
    // Apply the requested theme
    root.classList.add(theme);
    
    // Apply classic theme specific styles
    if (theme === "classic") {
      root.style.setProperty("--background", "245 245 245"); // light beige
      root.style.setProperty("--primary", "25 91 155"); // classic blue
      root.style.setProperty("--primary-foreground", "255 255 255");
      root.style.setProperty("--secondary", "191 219 254"); // light blue
      root.style.setProperty("--accent", "36 99 235"); // bright blue
    } else {
      // Reset any custom properties when not using classic theme
      root.style.removeProperty("--background");
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent");
    }
    
    // Save theme preference
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
