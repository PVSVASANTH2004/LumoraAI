import { cn } from '@/utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 'w-7 h-7 rounded-lg', text: 'text-base' },
  md: { icon: 'w-9 h-9 rounded-xl', text: 'text-lg' },
  lg: { icon: 'w-12 h-12 rounded-2xl', text: 'text-2xl' },
}

export default function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizes[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('bg-gradient-primary flex items-center justify-center shadow-glow-primary flex-shrink-0', s.icon)}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-7 h-7'}
        >
          <path d="M9 3H4C3.4 3 3 3.4 3 4V9C3 9.6 3.4 10 4 10H9C9.6 10 10 9.6 10 9V4C10 3.4 9.6 3 9 3Z" fill="white" fillOpacity="0.95"/>
          <path d="M20 3H15C14.4 3 14 3.4 14 4V9C14 9.6 14.4 10 15 10H20C20.6 10 21 9.6 21 9V4C21 3.4 20.6 3 20 3Z" fill="white" fillOpacity="0.65"/>
          <path d="M9 14H4C3.4 14 3 14.4 3 15V20C3 20.6 3.4 21 4 21H9C9.6 21 10 20.6 10 20V15C10 14.4 9.6 14 9 14Z" fill="white" fillOpacity="0.65"/>
          <path d="M20 14H15C14.4 14 14 14.4 14 15V20C14 20.6 14.4 21 15 21H20C20.6 21 21 20.6 21 20V15C21 14.4 20.6 14 20 14Z" fill="white" fillOpacity="0.4"/>
        </svg>
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight text-foreground', s.text)}>
          Lumora<span className="gradient-text"> AI</span>
        </span>
      )}
    </div>
  )
}
