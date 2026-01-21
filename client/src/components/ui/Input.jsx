import { cn } from '../../utils/cn'

export function Input({ className, ...props }) {
  return <input className={cn('ldm-input', className)} {...props} />
}

