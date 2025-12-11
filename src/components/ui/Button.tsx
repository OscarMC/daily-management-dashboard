import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm',
        ghost:
          'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
        secondary:
          'bg-blue-500 hover:bg-blue-600 text-white shadow-sm dark:bg-blue-600 dark:hover:bg-blue-500',
        danger:
          'bg-red-500 hover:bg-red-600 text-white shadow-sm dark:bg-red-600 dark:hover:bg-red-500',
        success:
          'bg-green-500 hover:bg-green-600 text-white shadow-sm dark:bg-green-600 dark:hover:bg-green-500',
        warning:
          'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm dark:bg-yellow-600 dark:hover:bg-yellow-500',
        outline:
          'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
        link: 'text-blue-500 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'px-2 py-1 text-xs h-7',
        md: 'px-3 py-1.5 text-sm h-9',
        lg: 'px-4 py-2 text-base h-10',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
