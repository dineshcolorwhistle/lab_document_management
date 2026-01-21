import { BrowserRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'

function AppFrame() {
  const { pathname } = useLocation()
  const isAuthRoute =
    pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password'

  if (isAuthRoute) {
    return (
      <div className="min-h-full">
        <main className="p-0">
          <AppRoutes />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-[#9C9F9F]/40 bg-[#F7F6F2]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold text-[#352D36]">Lab Document Management</div>
          <div className="text-xs text-[#7D7980]">MERN Compliance Platform</div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <AppRoutes />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppFrame />
    </BrowserRouter>
  )
}

export default App
