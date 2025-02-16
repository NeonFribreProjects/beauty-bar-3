import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initMonitoring } from './lib/monitoring'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from "./components/ui/tooltip"
import { ErrorBoundary } from "./components/ErrorBoundary"

// Initialize monitoring in production
if (process.env.NODE_ENV === 'production') {
  initMonitoring()
}

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
) 