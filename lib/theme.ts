export type Theme = "light" | "dark" | "system";
export const themeStorageKey = "levraicoutlyceen-theme";
export const normalizeTheme = (value: string | null | undefined): Theme =>
  value === "light" || value === "dark" ? value : "system";

// Runs before paint with no interpolated user input. CSS handles the system
// preference, including OS changes and visits with JavaScript disabled.
export const themeScript = `(function(){var t="system";try{var s=localStorage.getItem("${themeStorageKey}");if(s==="light"||s==="dark")t=s}catch(e){}document.documentElement.dataset.theme=t})()`;
