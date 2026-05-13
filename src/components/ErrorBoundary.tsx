import { Component, type ReactNode } from "react"
import { Link } from "react-router"

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-sm font-medium text-neutral-900 mb-2">Something went wrong</p>
            <p className="text-xs text-neutral-400 mb-6 font-mono">
              {this.state.error?.message}
            </p>
            <Link to="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 underline">
              Back to dashboard
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
