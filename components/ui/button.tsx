import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // 🟢 DEFAULT: Deep Teal BG + WHITE Text
        default:
          "bg-[#1a5353] text-white shadow hover:bg-[#111625]",

        // 🟠 DESTRUCTIVE: Orange BG + WHITE Text
        destructive:
          "bg-[#FB923C] text-white shadow-sm hover:bg-[#ea580c]",

        // ⚪ OUTLINE: Teal Border + TEAL Text -> Turns WHITE on Hover
        outline:
          "border border-[#1a5353] bg-transparent text-[#1a5353] shadow-sm hover:bg-[#1a5353] hover:text-white",

        // ⚫ SECONDARY: Navy BG + WHITE Text
        secondary:
          "bg-[#111625] text-white shadow-sm hover:bg-[#1a5353]",

        // 👻 GHOST: TEAL Text -> Background tints on Hover
        ghost: 
          "text-[#1a5353] hover:bg-[#1a5353]/10 hover:text-[#1a5353]",

        // 🔗 LINK: TEAL Text
        link: "text-[#1a5353] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
