import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import ThemeToggle from "#components/molecules/ThemeToggle";

type Props = { userName: string };

export default function PortalHeader({ userName }: Props) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-foreground/8 bg-background/80 px-8 py-4 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          {greeting()}, {userName.split(" ")[0]} 👋
        </h1>
        <p className="text-xs text-foreground/30">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year:    "numeric",
            month:   "long",
            day:     "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
        >
          View site
          <ArrowSquareOutIcon size={12} />
        </a>
      </div>
    </header>
  );
}
