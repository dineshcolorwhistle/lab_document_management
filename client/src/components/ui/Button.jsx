import { cn } from '../../utils/cn'

const variants = {
  primary: 'ldm-btn ldm-btn-primary',
  secondary: 'ldm-btn ldm-btn-secondary',
  ghost: 'ldm-btn ldm-btn-ghost',
}

export function Button({ className, variant = 'primary', type = 'button', ...props }) {
  return <button type={type} className={cn(variants[variant], className)} {...props} />
}

