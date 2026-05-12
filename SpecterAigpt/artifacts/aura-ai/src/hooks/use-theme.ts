import { create } from "zustand";

interface ThemeStore {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: (typeof window !== "undefined" && localStorage.getItem("theme") === "light") ? "light" : "dark",
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    return { theme: newTheme };
  }),
}));

// Init script helper
export const initTheme = () => {
  if (typeof window === "undefined") return;
  const theme = localStorage.getItem("theme") || "dark";
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
