import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { AuthProvider } from "./lib/auth-context"
import ErrorBoundary from "./components/ErrorBoundary"
import { ToastProvider } from "./components/ui/Toast"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
)
