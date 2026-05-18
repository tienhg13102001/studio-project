import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button } from "#components/ui/button";
import { useTheme } from "../ThemeProvider";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="bg-white/10 hover:bg-white/20 text-primary border border-white/20 rounded-md"
      aria-label="Toggle theme"
    >
      {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </Button>
  );
};

export default ThemeToggle;
