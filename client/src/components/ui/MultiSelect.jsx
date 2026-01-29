import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Multi-select dropdown with checkboxes.
 * @param {{ options: Array<{ id: string; name: string; email?: string }>; value: string[]; onChange: (ids: string[]) => void; placeholder?: string; label?: string; required?: boolean; error?: string; disabled?: boolean; className?: string }} props
 */
export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select...',
  label,
  required,
  error,
  disabled,
  className,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const selectedSet = new Set(value)
  const selectedOptions = options.filter((o) => selectedSet.has(o.id))
  const displayText =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length === 1
        ? selectedOptions[0].name
        : `${selectedOptions.length} selected`

  const toggle = (id) => {
    if (selectedSet.has(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const selectAll = () => {
    if (value.length === options.length) {
      onChange([])
    } else {
      onChange(options.map((o) => o.id))
    }
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-brand-primary">
          {label}
          {required && <span className="text-accent-red"> *</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border bg-brand-surface-elevated px-3 py-2.5 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-muted/20',
          error ? 'border-accent-red' : 'border-brand-muted/40',
          disabled && 'cursor-not-allowed opacity-60'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn('truncate', value.length === 0 && 'text-brand-muted')}>
          {displayText}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-brand-muted transition-transform', open && 'rotate-180')} />
      </button>
      {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-brand-border bg-brand-surface-elevated py-1 shadow-soft-xl">
          <div className="border-b border-brand-border/60 px-3 py-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-brand-primary hover:text-brand-primary-hover"
            >
              {value.length === options.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          {options.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-brand-muted">No options</div>
          ) : (
            <ul role="listbox" className="py-1">
              {options.map((opt) => (
                <li key={opt.id} role="option" aria-selected={selectedSet.has(opt.id)}>
                  <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-brand-muted/10">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(opt.id)}
                      onChange={() => toggle(opt.id)}
                      className="h-4 w-4 rounded border-brand-muted/40 text-brand-primary focus:ring-brand-muted/20"
                    />
                    <span className="font-medium text-brand-primary">{opt.name}</span>
                    {opt.email && (
                      <span className="truncate text-xs text-brand-muted">({opt.email})</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
