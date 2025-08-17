import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  radius?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  radius = 'md',
  className = '', 
  children, 
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center rounded-full font-medium 
    transition-colors focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 
    disabled:opacity-50 disabled:pointer-events-none
  `

  const variantClasses = {
    primary: `
      bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] 
      hover:bg-[hsl(var(--primary)/0.9)]
    `,
    secondary: `
      bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] 
      hover:bg-[hsl(var(--secondary)/0.8)]
    `,
    destructive: `
      bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] 
      hover:bg-[hsl(var(--destructive)/0.9)]
    `,
    outline: `
      border border-[hsl(var(--border))] bg-[hsl(var(--background))] 
      hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]
    `,
    ghost: `
      hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]
    `,
  }

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg',
  }

  const radiusClasses = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-full',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${radiusClasses[radius]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
} 