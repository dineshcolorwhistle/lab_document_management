import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

export function NotFoundPage() {
  return (
    <Card>
      <h1 className="text-lg font-semibold text-[#352D36]">Not found</h1>
      <p className="mt-2 text-sm text-[#7D7980]">The page you requested does not exist.</p>
      <Link className="mt-4 inline-block text-sm font-medium text-[#352D36] underline-offset-4 hover:underline" to="/">
        Go home
      </Link>
    </Card>
  )
}
