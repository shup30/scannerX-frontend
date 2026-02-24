import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './i18n'
import './styles/index.css'
import App from './App.jsx'

// Register service worker for PWA install support
registerSW({
  onNeedRefresh() { },
  onOfflineReady() { },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
