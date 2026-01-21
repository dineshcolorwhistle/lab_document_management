import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h1 className="text-lg font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
      <Link className="mt-4 inline-block text-sm font-medium text-blue-600" to="/">
        Go home
      </Link>
    </div>
  )
}
