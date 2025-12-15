import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CONFIG } from "@/config/simulador";
import { getActiveEvent, saveUnitEventData, getUnitEventData, UNIT_MAP } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AspectCards } from "@/components/AspectCards";
import { useScores } from "@/hooks/useScores";

const UNITS = [
  { code: "USM", name: "Usina São Martinho" },
  { code: "UIR", name: "Usina Iracema" },
  { code: "USC", name: "Usina Santa Cruz" },
  { code: "UBV", name: "Usina Boa Vista" },
];

const Index = () => {
  const navigate = useNavigate();
  const [loadingUnit, setLoadingUnit] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const { score } = useScores();

  // Check if there's already a selected unit on mount
  useEffect(() => {
    const stored = getUnitEventData();
    if (stored?.unitCode && stored?.eventId) {
      setSelectedUnit(stored.unitCode);
    }
    const storedGroupName = localStorage.getItem("acao_group_name");
    if (storedGroupName) {
      setGroupName(storedGroupName);
    }
  }, []);

  const handleSelectUnit = async (unitCode: string) => {
    setLoadingUnit(unitCode);

    try {
      const response = await getActiveEvent(unitCode);

      if (response.ok && response.event_id) {
        const unitId = UNIT_MAP[unitCode];
        saveUnitEventData(unitCode, unitId, response.event_id);
        setSelectedUnit(unitCode);
        toast.success(`Usina ${unitCode} selecionada!`);
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

  const handleChangeUnit = () => {
    setSelectedUnit(null);
    localStorage.removeItem("acao_unit_code");
    localStorage.removeItem("acao_unit_id");
    localStorage.removeItem("acao_event_id");
  };

  const handleSaveGroupName = () => {
    if (groupName.trim()) {
      localStorage.setItem("acao_group_name", groupName.trim());
      toast.success("Nome do grupo salvo!");
    }
  };

  const handleNavigateToQuestion = (questionId: number) => {
    navigate(`/question/${questionId}`);
  };

  const isGroupNameValid = groupName.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header badges={CONFIG.badges} />

      <main className="container mx-auto px-4 py-12 space-y-10">
        {/* State A: Unit Selection */}
        {!selectedUnit && (
          <>
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Pesquisa de Ação Transformadora
              </h1>
              <p className="text-muted-foreground text-lg">
                Selecione a sua usina para iniciar
              </p>
            </div>

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
          </>
        )}

        {/* State B: Group Area */}
        {selectedUnit && (
          <>
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Pesquisa de Ação Transformadora
              </h1>
              <div className="flex items-center justify-center gap-3">
                <p className="text-muted-foreground text-lg">
                  Usina selecionada: <span className="text-primary font-semibold">{selectedUnit}</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleChangeUnit}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Trocar usina
                </Button>
              </div>
            </div>

            {/* Aspect Cards */}
            <div className="max-w-3xl mx-auto">
              <AspectCards score={score} />
            </div>

            {/* Group Name Input */}
            <div className="max-w-md mx-auto">
              <div className="card-simulator p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName" className="text-foreground">
                    Nome do Grupo *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Digite o nome do grupo"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSaveGroupName}
                      disabled={!isGroupNameValid}
                      variant="default"
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Buttons */}
            <div className="max-w-2xl mx-auto">
              <div className="card-simulator p-8 space-y-6">
                <h2 className="text-xl font-semibold text-foreground text-center">
                  Selecione uma Pergunta
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CONFIG.stages.map((stage) => (
                    <Button
                      key={stage.id}
                      onClick={() => handleNavigateToQuestion(stage.id)}
                      disabled={!isGroupNameValid}
                      variant="outline"
                      className="h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50"
                    >
                      <span className="text-lg font-bold text-foreground">
                        {stage.title}
                      </span>
                    </Button>
                  ))}
                </div>

                {!isGroupNameValid && (
                  <p className="text-center text-sm text-muted-foreground">
                    Preencha o nome do grupo para habilitar as perguntas
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
