
import { Button } from "@/components/ui/button";
import { ToastProvider } from "./ui/toast";
import { useToast } from "@/hooks/use-toast";

const TestToast = () => {
  const { toast } = useToast();
  console.log(toast)

  return (
    <ToastProvider>
      <Button
        onClick={() => {
          console.log("Toast clicado"); // Verificar se o botão está funcionando
          toast({
            title: "Teste",
            description: "Este é um teste de toast.",
            
          });
        }}
      >
        Mostrar Toast
      </Button>
    </ToastProvider>
  );
};

export default TestToast;
