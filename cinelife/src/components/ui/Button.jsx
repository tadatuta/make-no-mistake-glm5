import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'font-primary font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2'

  const variants = {
    primary: 'bg-cinema-gold text-midnight hover:bg-spotlight hover:shadow-glow active:bg-deep-red active:text-white disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-transparent border-2 border-cinema-gold text-cinema-gold hover:bg-cinema-gold hover:text-midnight',
    ghost: 'bg-transparent text-white hover:bg-white/10'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
