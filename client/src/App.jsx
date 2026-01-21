import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-full">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="text-sm font-semibold">Lab Document Management</div>
            <div className="text-xs text-slate-500">MERN Compliance Platform</div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
