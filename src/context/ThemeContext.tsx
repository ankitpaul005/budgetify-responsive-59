import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state with a function instead of directly accessing window/localStorage
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    
    // Check local storage first
    const storedTheme = localStorage.getItem("budgetify-theme") as Theme | null;
    
    // If stored theme exists, use it
    if (storedTheme) {
      return storedTheme;
    }
    
    // Otherwise default to system
    return "system";
  });

  // Apply theme changes to document
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    // Handle system preference
    const handleSystemPreference = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (theme === "system") {
        prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
      }
    };
    
    // Set theme based on preference
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else if (theme === "system") {
      handleSystemPreference();
      
      // Listen for system preference changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", handleSystemPreference);
      
      return () => mediaQuery.removeEventListener("change", handleSystemPreference);
    }
    
    // Save theme preference to local storage
    localStorage.setItem("budgetify-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const toggleTheme = () => {
    setThemeState(prev => {
      // Cycle through themes: light -> dark -> system -> light
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
