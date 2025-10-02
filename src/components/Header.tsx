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
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-lg bg-background/80">
      <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
        <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {logo ? (
              <img
                src={logo ?? acaoLogo}
                alt="Logo da Ação Consultoria"
                className="h-8 md:h-12 w-auto object-contain"
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">Carregar Logo</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Title Section */}
          <div className="flex-1 text-center min-w-0">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground">
              Decisão na Usina — Simulador (Ação)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
              Simulador (ESG + Excelência) — Ação Consultoria
            </p>
          </div>

          {/* Badges and Theme Toggle Section */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Theme Toggle */}
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

            {/* Badges */}
            {badges.map((badge, index) => (
              <div
                key={index}
                className="badge-status bg-primary/20 text-primary border-primary/30"
              >
                <span className="font-medium">{badge.label}:</span>{" "}
                <span>{badge.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};