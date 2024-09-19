import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function NotFound() {

  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen gap-1">
      <Button variant={"ghost"} className="fixed font-extrabold text-[1.2rem] left-2 top-2" onClick={handleGoBack}><ChevronLeft/>Voltar</Button>
      <img src="404.png" alt="Imagem de erro 404" className="w-80"/>
      <h1 className="font-extrabold text-5xl">Pagina não encontrada</h1>
      <p className="font-light text-[1.3rem]">Desculpe, a página que você está tentando acessar não existe.</p>
    </div>
  )
}
