import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

const Cover = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-4xl">
            Pesquisa de Ação Transformadora
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Descubra como suas decisões impactam diferentes aspectos da sua organização
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/")}
            className="mt-8 text-lg px-8 py-6"
          >
            Iniciar Pesquisa
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Cover;
