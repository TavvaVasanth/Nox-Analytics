import React, { useContext, useEffect, useState } from "react";

const ThemeContext = React.createContext("light");

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    } else {
      // If no theme saved, use time-based preference
      const hour = new Date().getHours();
      return hour >= 18 || hour < 6; // dark mode from 6pm to 6am
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useDarkMode = () => useContext(ThemeContext);
