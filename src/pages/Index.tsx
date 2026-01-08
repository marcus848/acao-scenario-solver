import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CONFIG } from "@/config/simulador";
import { getActiveEvent, saveUnitEventData, getUnitEventData, UNIT_MAP, saveGroupToBackend, saveGroupData, getGroupData, listGroups, GroupItem, checkAnswered, listAnsweredQuestions, getQuestionLocks } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AspectCards } from "@/components/AspectCards";
import { useScores } from "@/hooks/useScores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNITS = [
  { code: "USM", name: "Usina São Martinho" },
  { code: "UIR", name: "Usina Iracema" },
  { code: "USC", name: "Usina Santa Cruz" },
  { code: "UBV", name: "Usina Boa Vista" },
];

type GroupMode = "register" | "recover";

const Index = () => {
  const navigate = useNavigate();
  const [loadingUnit, setLoadingUnit] = useState<string | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);
  const { score, refreshGroupScore } = useScores();

  // Group mode state
  const [groupMode, setGroupMode] = useState<GroupMode>("register");
  const [availableGroups, setAvailableGroups] = useState<GroupItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedRecoverGroupId, setSelectedRecoverGroupId] = useState<string>("");

  // Question answered state
  const [checkingQuestion, setCheckingQuestion] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [loadingAnsweredQuestions, setLoadingAnsweredQuestions] = useState(false);

  // Refresh answered questions from backend
  const refreshAnsweredQuestions = async () => {
    const stored = getUnitEventData();
    const groupData = getGroupData();

    if (!stored.eventId || !stored.unitId || !groupData.groupId) {
      setAnsweredQuestions(new Set());
      return;
    }

    setLoadingAnsweredQuestions(true);
    try {
      const response = await listAnsweredQuestions(
        Number(stored.eventId),
        Number(stored.unitId),
        Number(groupData.groupId)
      );

      if (response.ok && response.answered) {
        setAnsweredQuestions(new Set(response.answered));
      } else {
        console.warn("Erro ao buscar perguntas respondidas:", response.message);
        setAnsweredQuestions(new Set());
      }
    } catch (error) {
      console.error("Erro ao buscar perguntas respondidas:", error);
      setAnsweredQuestions(new Set());
    } finally {
      setLoadingAnsweredQuestions(false);
    }
  };

  // Check if there's already a selected unit and group on mount
  useEffect(() => {
    const stored = getUnitEventData();
    if (stored?.unitCode && stored?.eventId) {
      setSelectedUnit(stored.unitCode);
    }
    const storedGroup = getGroupData();
    if (storedGroup.groupName) {
      setGroupName(storedGroup.groupName);
    }
    if (storedGroup.groupId) {
      setGroupId(Number(storedGroup.groupId));
      // Refresh score from backend if group is already set
      refreshGroupScore();
    }
  }, [refreshGroupScore]);

  // Refresh answered questions when group changes
  useEffect(() => {
    if (groupId !== null) {
      refreshAnsweredQuestions();
    } else {
      setAnsweredQuestions(new Set());
    }
  }, [groupId]);

  // Fetch groups when switching to recover mode
  useEffect(() => {
    if (groupMode === "recover" && selectedUnit && !isGroupRegistered) {
      fetchGroups();
    }
  }, [groupMode, selectedUnit]);

  const fetchGroups = async () => {
    const stored = getUnitEventData();
    if (!stored.eventId || !stored.unitId) {
      toast.error("Selecione a usina primeiro.");
      return;
    }

    setLoadingGroups(true);
    try {
      const response = await listGroups(Number(stored.eventId), Number(stored.unitId));
      if (response.ok && response.groups) {
        setAvailableGroups(response.groups);
      } else {
        toast.error(response.message || "Erro ao buscar grupos.");
        setAvailableGroups([]);
      }
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      toast.error("Erro ao conectar com o servidor.");
      setAvailableGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

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
        toast.error("Nenhuma Turma ativa para esta usina. Peça ao consultor para iniciar.");
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
    setGroupId(null);
    setGroupName("");
    setGroupMode("register");
    setAvailableGroups([]);
    setSelectedRecoverGroupId("");
    setAnsweredQuestions(new Set());
    localStorage.removeItem("acao_unit_code");
    localStorage.removeItem("acao_unit_id");
    localStorage.removeItem("acao_event_id");
    localStorage.removeItem("acao_group_id");
    localStorage.removeItem("acao_group_name");
  };

  const handleConfirmGroup = async () => {
    const stored = getUnitEventData();
    if (!stored.eventId || !stored.unitId || !groupName.trim()) {
      toast.error("Dados incompletos. Selecione uma usina e preencha o nome do grupo.");
      return;
    }

    setLoadingGroup(true);
    try {
      const response = await saveGroupToBackend({
        event_id: Number(stored.eventId),
        unit_id: Number(stored.unitId),
        group_name: groupName.trim(),
      });

      if (response.ok === true && response.group_id) {
        saveGroupData(response.group_id, groupName.trim());
        setGroupId(response.group_id);
        toast.success("Grupo registrado com sucesso!");
        // Refresh score from backend after group registration
        refreshGroupScore();
      } else {
        // Grupo já existe ou outro erro
        toast.error("Este grupo já existe nesta rodada. Use 'Recuperar grupo'.");
      }
    } catch (error) {
      console.error("Erro ao registrar grupo:", error);
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setLoadingGroup(false);
    }
  };

  const handleRecoverGroup = () => {
    if (!selectedRecoverGroupId) {
      toast.error("Selecione um grupo.");
      return;
    }

    const selectedGroup = availableGroups.find(g => String(g.id) === selectedRecoverGroupId);
    if (!selectedGroup) {
      toast.error("Grupo não encontrado.");
      return;
    }

    saveGroupData(selectedGroup.id, selectedGroup.name);
    setGroupId(selectedGroup.id);
    setGroupName(selectedGroup.name);
    toast.success("Grupo selecionado com sucesso!");
    // Refresh score from backend after group recovery
    refreshGroupScore();
  };

  const handleNavigateToQuestion = async (questionId: number) => {
    const stored = getUnitEventData();
    const groupData = getGroupData();

    if (!stored.eventId || !groupData.groupId) {
      toast.error("Selecione usina e confirme grupo antes de responder.");
      return;
    }

    setCheckingQuestion(questionId);
    try {
      // 1. Check if question is unlocked by current round
      const locksResponse = await getQuestionLocks(Number(stored.eventId));
      if (locksResponse.ok && locksResponse.locks) {
        const lockKey = `q${questionId}` as keyof typeof locksResponse.locks;
        if (locksResponse.locks[lockKey] === 0) {
          toast.error("Pergunta bloqueada. Aguarde a liberação do consultor.");
          return;
        }
      } else {
        console.warn("Não foi possível verificar locks, permitindo acesso.");
      }

      // 2. Check if already answered
      const response = await checkAnswered(
        Number(stored.eventId),
        Number(groupData.groupId),
        questionId
      );

      if (response.ok && response.answered) {
        toast.error("Este grupo já respondeu esta pergunta.");
        setAnsweredQuestions(prev => new Set(prev).add(questionId));
        return;
      }

      // Navigate if unlocked and not answered
      navigate(`/question/${questionId}`);
    } catch (error) {
      console.error("Erro ao verificar resposta:", error);
      toast.error("Erro ao verificar status da pergunta.");
    } finally {
      setCheckingQuestion(null);
    }
  };

  const isGroupNameValid = groupName.trim().length > 0;
  const isGroupRegistered = groupId !== null;

  return (
    <div className="min-h-screen bg-background">
      <Header badges={CONFIG.badges} />

      {/* Aspect Cards - Always visible at top when unit selected */}
      {selectedUnit && (
        <div className="container mx-auto px-4 pt-6">
          <AspectCards score={score} />
        </div>
      )}

      <main className={`container mx-auto px-4 ${selectedUnit ? 'py-8 space-y-6' : 'py-12 space-y-10'}`}>
        {/* State A: Unit Selection */}
        {!selectedUnit && (
          <>
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Sensibilização 2026
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
                  Usina selecionada: <span className="text-accent font-semibold">{selectedUnit}</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleChangeUnit}
                  className="text-muted-foreground hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Trocar usina
                </Button>
              </div>
            </div>

            {/* Group Card */}
            <div className="max-w-md mx-auto">
              <div className="card-simulator p-6 space-y-4">
                {/* Mode Toggle */}
                {!isGroupRegistered && (
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <button
                      onClick={() => setGroupMode("register")}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${groupMode === "register"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Cadastrar grupo
                    </button>
                    <button
                      onClick={() => setGroupMode("recover")}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${groupMode === "recover"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Recuperar grupo
                    </button>
                  </div>
                )}

                {/* Mode: Register */}
                {groupMode === "register" && (
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
                        disabled={isGroupRegistered || loadingGroup}
                      />
                      <Button
                        onClick={handleConfirmGroup}
                        disabled={!isGroupNameValid || isGroupRegistered || loadingGroup}
                        variant="default"
                      >
                        {loadingGroup ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isGroupRegistered ? (
                          "Confirmado"
                        ) : (
                          "Confirmar grupo"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Mode: Recover */}
                {groupMode === "recover" && !isGroupRegistered && (
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Selecione o Grupo *
                    </Label>
                    {loadingGroups ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : availableGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        Nenhum grupo cadastrado ainda para esta rodada.
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          value={selectedRecoverGroupId}
                          onValueChange={setSelectedRecoverGroupId}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione um grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableGroups.map((group) => (
                              <SelectItem key={group.id} value={String(group.id)}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleRecoverGroup}
                          disabled={!selectedRecoverGroupId}
                          variant="default"
                        >
                          Continuar
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Success Message */}
                {isGroupRegistered && (
                  <p className="text-sm text-green-500">
                    Grupo selecionado (ID: {groupId}) - {groupName}
                  </p>
                )}
              </div>
            </div>

            {/* Question Buttons */}
            <div className="max-w-2xl mx-auto">
              <div className="card-simulator p-8 space-y-6">
                <h2 className="text-xl font-semibold text-foreground text-center">
                  Selecione uma Pergunta
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CONFIG.stages.map((stage) => {
                    const isAnswered = answeredQuestions.has(stage.id);
                    const isChecking = checkingQuestion === stage.id;

                    return (
                      <Button
                        key={stage.id}
                        onClick={() => handleNavigateToQuestion(stage.id)}
                        disabled={!isGroupRegistered || isAnswered || isChecking}
                        variant={isAnswered ? "secondary" : "outline"}
                        className={`h-auto py-4 px-4 flex flex-col items-center gap-2 transition-all disabled:opacity-50 ${isAnswered
                          ? "bg-green-500/10 border-green-500/30 text-green-500"
                          : "hover:bg-primary/10 hover:border-primary"
                          }`}
                      >
                        {isChecking ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isAnswered ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : null}
                        <span className={`text-lg font-bold ${isAnswered ? "text-green-500" : "text-foreground"}`}>
                          {stage.title}
                        </span>
                        {isAnswered && (
                          <span className="text-xs text-green-500/80">Respondida</span>
                        )}
                      </Button>
                    );
                  })}
                </div>

                {!isGroupRegistered && (
                  <p className="text-center text-sm text-muted-foreground">
                    Confirme o nome do grupo para habilitar as perguntas
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
