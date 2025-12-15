import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CONFIG } from "@/config/simulador";
import { getActiveEvent, saveUnitEventData, UNIT_MAP } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const UNITS = [
  { code: "USM", name: "Usina São Martinho" },
  { code: "UIR", name: "Usina Iracema" },
  { code: "USC", name: "Usina Santa Cruz" },
  { code: "UBV", name: "Usina Boa Vista" },
];

const Index = () => {
  const navigate = useNavigate();
  const [loadingUnit, setLoadingUnit] = useState<string | null>(null);

  const handleSelectUnit = async (unitCode: string) => {
    setLoadingUnit(unitCode);

    try {
      const response = await getActiveEvent(unitCode);

      if (response.ok && response.event_id) {
        const unitId = UNIT_MAP[unitCode];
        saveUnitEventData(unitCode, unitId, response.event_id);
        toast.success(`Usina ${unitCode} selecionada!`);
        // TODO: navegar para próxima etapa quando implementada
        // navigate("/grupo");
      } else {
        toast.error("Nenhuma rodada ativa para esta usina. Peça ao consultor para iniciar.");
      }
    } catch (error) {
      console.error("Erro ao selecionar usina:", error);
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setLoadingUnit(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header badges={CONFIG.badges} />

      <main className="container mx-auto px-4 py-12 space-y-10">
        {/* Intro Section */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Pesquisa de Ação Transformadora
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecione a sua usina para iniciar
          </p>
        </div>

        {/* Unit Selection */}
        <div className="max-w-2xl mx-auto">
          <div className="card-simulator p-8 space-y-6">
            <h2 className="text-xl font-semibold text-foreground text-center">
              Selecione a Usina
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {UNITS.map((unit) => {
                const isLoading = loadingUnit === unit.code;
                return (
                  <Button
                    key={unit.code}
                    onClick={() => handleSelectUnit(unit.code)}
                    disabled={loadingUnit !== null}
                    variant="outline"
                    className="h-auto py-6 px-4 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary" />
                    )}
                    <div className="text-center">
                      <span className="block text-lg font-bold text-foreground">
                        {unit.code}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {unit.name}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
