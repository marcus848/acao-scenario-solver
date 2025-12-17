import { Upload, Sun, Moon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import acaoLogo from "@/assets/images/logo_header.webp";

interface HeaderProps {
  badges?: { label: string; value: string }[];
}

export const Header = ({ badges = [] }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [logo, setLogo] = useState<string | null>(
    localStorage.getItem("acao_logo")
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("acao_logo") : null;
      setLogo(stored ?? acaoLogo);
    } catch {
      setLogo(acaoLogo);
    }
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogo(result);
        try {
          localStorage.setItem("acao_logo", result);
        } catch {
          console.error("Failed to save logo to localStorage");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/20 backdrop-blur-lg bg-background/80">
      <div className="container mx-auto px-3 py-2 lg:py-3">
        {/* Desktop Layout (lg+): Single row */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            {logo ? (
              <img
                src={logo ?? acaoLogo}
                alt="Logo da Ação Consultoria"
                className="h-10 w-auto object-contain cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              />
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">Carregar Logo</span>
              </button>
            )}
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
                className="badge-status bg-primary/20 text-primary border-primary/30 px-3 py-1.5 rounded-lg text-sm"
              >
                <span className="font-medium">{badge.label}:</span>{" "}
                <span>{badge.value}</span>
              </div>
            ))}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
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
          {/* Row 1: Logo + Theme Toggle */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              {logo ? (
                <img
                  src={logo ?? acaoLogo}
                  alt="Logo da Ação Consultoria"
                  className="h-7 md:h-9 w-auto object-contain cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                />
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Upload className="h-3 w-3" />
                  <span className="text-xs">Logo</span>
                </button>
              )}
            </div>

            {/* Theme Toggle */}
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

          {/* Row 2: Title + Meta Badge */}
          <div className="flex items-center justify-between gap-2">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-xl font-bold text-foreground leading-tight">
                CUIDAR
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                COMPROMISSO DIÁRIO DE TODOS NÓS
              </p>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] md:text-xs whitespace-nowrap"
                  >
                    <span className="font-medium">{badge.label}:</span>{" "}
                    <span>{badge.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>
    </header>
  );
};