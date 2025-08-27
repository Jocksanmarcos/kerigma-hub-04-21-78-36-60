import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/core/providers/AppProviders'
import App from './App.tsx'
import './index.css'

// Initialize PWA features
import { pwaManager } from '@/lib/pwa/pwa-manager'
import { offlineDB } from '@/lib/pwa/offline-db'

// Initialize offline database
offlineDB.init().catch(console.error)

// PWA is auto-registered in pwa-manager

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)

