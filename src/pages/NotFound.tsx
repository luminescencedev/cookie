import { Link } from "react-router"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-semibold text-neutral-200 mb-4">404</p>
        <p className="text-sm font-medium text-neutral-900 mb-1">Page not found</p>
        <p className="text-sm text-neutral-400 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-900 underline">
          Go home
        </Link>
      </div>
    </div>
  )
}
