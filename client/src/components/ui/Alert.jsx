import { cn } from '../../utils/cn'

const variants = {
  info: 'ldm-alert ldm-alert-info',
  success: 'ldm-alert ldm-alert-success',
  warning: 'ldm-alert ldm-alert-warning',
  danger: 'ldm-alert ldm-alert-danger',
}

export function Alert({ className, variant = 'info', title, children }) {
  return (
    <div className={cn(variants[variant], className)} role="alert">
      {title ? <div className="text-sm font-semibold text-[#352D36]">{title}</div> : null}
      {children ? <div className={cn('text-sm', title ? 'mt-1' : '')}>{children}</div> : null}
    </div>
  )
}

