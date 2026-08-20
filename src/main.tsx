import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WhiteboardPage } from './features/whiteboard/ui/pages/whiteboard-page/whiteboard-page.tsx'
import '@core/styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WhiteboardPage />
  </StrictMode>,
)
