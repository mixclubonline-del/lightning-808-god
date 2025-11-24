import { useEffect, useState } from "react";

export type ThemeName = "olympus" | "hades" | "poseidon" | "apollo" | "artemis";

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  ring: string;
  synthGlow: string;
  synthDeep: string;
  synthPanel: string;
  synthBorder: string;
  synthAccent: string;
}

const themes: Record<ThemeName, ThemeColors> = {
  olympus: {
    // Red/Gold - Zeus/Fire theme (default)
    background: "0 0% 4%",
    foreground: "0 0% 95%",
    card: "0 0% 6%",
    cardForeground: "0 0% 95%",
    primary: "0 84% 60%",
    primaryForeground: "0 0% 98%",
    secondary: "0 72% 51%",
    secondaryForeground: "0 0% 98%",
    muted: "0 20% 15%",
    mutedForeground: "0 10% 60%",
    accent: "25 95% 53%",
    accentForeground: "0 0% 98%",
    border: "0 72% 25%",
    ring: "0 84% 60%",
    synthGlow: "0 84% 60%",
    synthDeep: "0 0% 4%",
    synthPanel: "0 20% 8%",
    synthBorder: "0 72% 35%",
    synthAccent: "25 95% 53%",
  },
  hades: {
    // Purple/Dark - Underworld theme
    background: "270 30% 4%",
    foreground: "270 10% 95%",
    card: "270 30% 6%",
    cardForeground: "270 10% 95%",
    primary: "270 80% 60%",
    primaryForeground: "270 10% 98%",
    secondary: "280 70% 50%",
    secondaryForeground: "270 10% 98%",
    muted: "270 25% 12%",
    mutedForeground: "270 15% 60%",
    accent: "290 95% 55%",
    accentForeground: "270 10% 98%",
    border: "270 60% 25%",
    ring: "270 80% 60%",
    synthGlow: "270 80% 60%",
    synthDeep: "270 30% 4%",
    synthPanel: "270 30% 8%",
    synthBorder: "270 60% 30%",
    synthAccent: "290 95% 55%",
  },
  poseidon: {
    // Blue/Cyan - Ocean theme
    background: "200 40% 4%",
    foreground: "200 10% 95%",
    card: "200 35% 6%",
    cardForeground: "200 10% 95%",
    primary: "190 85% 55%",
    primaryForeground: "200 10% 98%",
    secondary: "195 70% 50%",
    secondaryForeground: "200 10% 98%",
    muted: "200 30% 12%",
    mutedForeground: "200 15% 60%",
    accent: "175 95% 50%",
    accentForeground: "200 10% 98%",
    border: "200 60% 25%",
    ring: "190 85% 55%",
    synthGlow: "190 85% 55%",
    synthDeep: "200 40% 4%",
    synthPanel: "200 35% 8%",
    synthBorder: "200 60% 30%",
    synthAccent: "175 95% 50%",
  },
  apollo: {
    // Gold/Yellow - Sun theme
    background: "45 25% 4%",
    foreground: "45 10% 95%",
    card: "45 25% 6%",
    cardForeground: "45 10% 95%",
    primary: "45 100% 55%",
    primaryForeground: "45 10% 10%",
    secondary: "40 90% 50%",
    secondaryForeground: "45 10% 10%",
    muted: "45 20% 15%",
    mutedForeground: "45 15% 60%",
    accent: "35 100% 55%",
    accentForeground: "45 10% 10%",
    border: "45 50% 25%",
    ring: "45 100% 55%",
    synthGlow: "45 100% 55%",
    synthDeep: "45 25% 4%",
    synthPanel: "45 25% 8%",
    synthBorder: "45 50% 30%",
    synthAccent: "35 100% 55%",
  },
  artemis: {
    // Green/Silver - Nature/Moon theme
    background: "160 30% 4%",
    foreground: "160 10% 95%",
    card: "160 25% 6%",
    cardForeground: "160 10% 95%",
    primary: "150 70% 50%",
    primaryForeground: "160 10% 98%",
    secondary: "155 60% 45%",
    secondaryForeground: "160 10% 98%",
    muted: "160 20% 12%",
    mutedForeground: "160 15% 60%",
    accent: "140 85% 50%",
    accentForeground: "160 10% 98%",
    border: "160 50% 25%",
    ring: "150 70% 50%",
    synthGlow: "150 70% 50%",
    synthDeep: "160 30% 4%",
    synthPanel: "160 25% 8%",
    synthBorder: "160 50% 30%",
    synthAccent: "140 85% 50%",
  },
};

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("olympus-theme");
    return (saved as ThemeName) || "olympus";
  });

  const applyTheme = (themeName: ThemeName) => {
    const theme = themes[themeName];
    const root = document.documentElement;

    // Apply all color variables
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--foreground", theme.foreground);
    root.style.setProperty("--card", theme.card);
    root.style.setProperty("--card-foreground", theme.cardForeground);
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-foreground", theme.primaryForeground);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--secondary-foreground", theme.secondaryForeground);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--muted-foreground", theme.mutedForeground);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-foreground", theme.accentForeground);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--ring", theme.ring);
    root.style.setProperty("--synth-glow", theme.synthGlow);
    root.style.setProperty("--synth-deep", theme.synthDeep);
    root.style.setProperty("--synth-panel", theme.synthPanel);
    root.style.setProperty("--synth-border", theme.synthBorder);
    root.style.setProperty("--synth-accent", theme.synthAccent);
    
    // Also update destructive to match primary for consistency
    root.style.setProperty("--destructive", theme.primary);
    root.style.setProperty("--destructive-foreground", theme.primaryForeground);
    root.style.setProperty("--input", theme.border);
  };

  const switchTheme = (themeName: ThemeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem("olympus-theme", themeName);
    applyTheme(themeName);
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  return {
    currentTheme,
    switchTheme,
    themes: Object.keys(themes) as ThemeName[],
  };
};
