import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CONFIG } from "@/config/simulador";
import { getGroupName, saveGroupName } from "@/lib/api";
import { toast } from "sonner";
import { Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [savedGroupName, setSavedGroupName] = useState<string | null>(null);

  useEffect(() => {
    const saved = getGroupName();
    if (saved) {
      setSavedGroupName(saved);
      setGroupName(saved);
    }
  }, []);

  const handleSaveGroupName = () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      toast.error("Por favor, preencha o nome do grupo.");
      return;
    }

    if (saveGroupName(trimmedName)) {
      setSavedGroupName(trimmedName);
      toast.success("Nome do grupo salvo com sucesso!");
    } else {
      toast.error("Erro ao salvar o nome do grupo.");
    }
  };

  const handleGoToQuestion = (questionId: number) => {
    if (!savedGroupName) {
      toast.error("Salve o nome do grupo antes de responder as perguntas.");
      return;
    }
    navigate(`/question/${questionId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header badges={CONFIG.badges} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Intro Section */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Pesquisa de Ação Transformadora
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubra como suas decisões impactam diferentes aspectos da sua organização.
          </p>
        </div>

        {/* Group Name Section */}
        <div className="max-w-xl mx-auto">
          <div className="card-simulator p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Identificação do Grupo
            </h2>
            
            <div className="space-y-3">
              <label htmlFor="groupName" className="text-sm text-muted-foreground">
                Nome do Grupo
              </label>
              <div className="flex gap-3">
                <Input
                  id="groupName"
                  type="text"
                  placeholder="Digite o nome do grupo..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveGroupName} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
              
              {savedGroupName && (
                <p className="text-sm text-success">
                  ✓ Grupo salvo: <strong>{savedGroupName}</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="max-w-xl mx-auto">
          <div className="card-simulator p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Perguntas Disponíveis
            </h2>
            
            <div className="grid gap-3">
              {CONFIG.stages.map((stage, index) => (
                <button
                  key={stage.id}
                  onClick={() => handleGoToQuestion(stage.id)}
                  className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 border border-border rounded-lg transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-foreground font-medium">
                      {stage.title}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aspects Info */}
        <div className="max-w-xl mx-auto">
          <div className="card-simulator p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Aspectos Avaliados
            </h2>
            <div className="grid gap-2">
              {CONFIG.aspects.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
