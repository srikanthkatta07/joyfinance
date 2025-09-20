import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Index from './pages/Index.tsx'
import NotFound from './pages/NotFound.tsx'
import Auth from './pages/Auth.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { Toaster as Sonner } from './components/ui/sonner.tsx'
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/joyfinance">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
      <PWAUpdatePrompt />
    </AuthProvider>
  </StrictMode>,
)
