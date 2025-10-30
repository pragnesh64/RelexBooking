import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme, type ThemePreference } from "../../hooks/useTheme";
import { motion } from "framer-motion";

const options: Array<{ value: ThemePreference; icon: React.ReactNode; label: string }> = [
  { value: "light", icon: <Sun size={16} />, label: "Light" },
  { value: "dark", icon: <Moon size={16} />, label: "Dark" },
  { value: "system", icon: <Laptop size={16} />, label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex bg-muted rounded-full p-1 gap-1 items-center shadow-inner border w-fit">
      {options.map((option) => {
        const active = theme === option.value;

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`relative flex items-center gap-1 px-3 py-1 text-sm rounded-full transition 
            ${active ? "text-foreground" : "text-muted-foreground"}`}
          >
            {active && (
              <motion.div
                layoutId="themeToggle"
                className="absolute inset-0 bg-primary/20 rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}

            <span className="relative flex items-center gap-1">
              {option.icon}
              {/* <span className="hidden md:inline">{option.label}</span> */}
            </span>
          </button>
        );
      })}
    </div>
  );
}
