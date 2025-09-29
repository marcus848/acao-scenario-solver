import { Upload } from "lucide-react";
import { useState, useRef } from "react";

interface HeaderProps {
  badges?: { label: string; value: string }[];
}

export const Header = ({ badges = [] }: HeaderProps) => {
  const [logo, setLogo] = useState<string | null>(
    localStorage.getItem("acao_logo")
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogo(result);
        localStorage.setItem("acao_logo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-lg bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            {logo ? (
              <img
                src={logo}
                alt="Logo da Ação Consultoria"
                className="h-12 w-auto object-contain"
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Decisão na Usina — Simulador (Ação)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Simulador (ESG + Excelência) — Ação Consultoria
            </p>
          </div>

          {/* Badges Section */}
          <div className="flex items-center gap-3 flex-wrap">
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