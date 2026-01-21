import { cn } from '../../utils/cn'

export function Card({ className, children }) {
  return (
    <div className={cn('ldm-card', className)}>
      {children}
    </div>
  )
}

