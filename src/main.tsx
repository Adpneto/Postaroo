import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './global.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './firebaseConfig'
import './translate/i18n.js'
import { RecoilRoot } from 'recoil'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RecoilRoot>
          <App/>
        </RecoilRoot>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
