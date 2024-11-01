import { ThemeProvider } from "./components/theme-provider"
import { Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import NotFound from "./pages/notFound"
import Visitant from "./components/layouts/layout-base"
import Sign from "./pages/sign"
import { TooltipProvider } from "./components/ui/tooltip"
import ProfileCompletion from "./pages/completeProfile"
import { ToastProvider } from "./components/ui/toast"

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ToastProvider>
        <TooltipProvider>
          <Routes>
            <Route element={<Visitant />}>
              <Route path="/" element={<Home />} />
            </Route>
            <Route path="/sign" element={<Sign />} />
            <Route path="/complete-profile" element={<ProfileCompletion />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
