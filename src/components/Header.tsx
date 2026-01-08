import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import acaoLogoDark from "@/assets/images/logo_header_dark.png";
import acaoLogoLight from "@/assets/images/logo_header_light.png";

interface HeaderProps {
  badges?: { label: string; value: string }[];
}

export const Header = ({ badges = [] }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const logo = theme === "dark" ? acaoLogoDark : acaoLogoLight;

  return (
    <header className="sticky top-0 z-50 border-b border-border/20 backdrop-blur-lg bg-background/80">
      <div className="container mx-auto px-3 py-2 lg:py-3">
        {/* Desktop Layout (lg+): Single row */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo da Ação Consultoria"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Title - Center */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-foreground">CUIDAR</h1>
            <p className="text-sm text-muted-foreground">
              COMPROMISSO DIÁRIO DE TODOS NÓS
            </p>
          </div>

          {/* Badges + Theme Toggle - Right */}
          <div className="flex items-center gap-3">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="badge-status bg-accent/20 text-foreground border-accent/30 px-3 py-1.5 rounded-lg text-sm"
              >
                <span className="font-medium">{badge.label}:</span>{" "}
                <span>{badge.value}</span>
              </div>
            ))}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border border-primary/30 bg-accent/20 hover:bg-accent/40 transition-colors"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Tablet/Mobile Layout (<lg): Two rows */}
        <div className="lg:hidden flex flex-col gap-2">
          {/* Row 1: Logo + Meta + Theme Toggle */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center min-w-0">
              <img
                src={logo}
                alt="Logo da Ação Consultoria"
                className="h-7 md:h-9 w-auto object-contain"
              />
            </div>

            {/* Meta Badge + Theme Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-accent/20 text-foreground border border-accent/30 px-2 py-0.5 rounded text-[10px] md:text-xs whitespace-nowrap"
                >
                  <span className="font-medium">{badge.label}:</span>{" "}
                  <span>{badge.value}</span>
                </div>
              ))}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="Alternar tema"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Title only, centered */}
          <div className="text-center">
            <h1 className="text-base md:text-xl font-bold text-foreground leading-tight">
              CUIDAR
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">
              COMPROMISSO DIÁRIO DE TODOS NÓS
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};