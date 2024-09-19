import { ThemeProvider } from "./components/theme-provider"
import { Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import Index from "./pages"
import NotFound from "./pages/notFound"
import Visitant from "./components/layouts/visitant"
import Client from "./components/layouts/client"

function App() {

  return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route element={<Visitant/>}>
            <Route path="/" element={<Index/>}/>
          </Route>
          <Route element={<Client/>}>
            <Route path="/home" element={<Home/>}/>
          </Route>

          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </ThemeProvider>
  )
}

export default App
