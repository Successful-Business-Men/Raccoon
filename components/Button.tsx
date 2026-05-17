import { forwardRef, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-black hover:bg-brand-hover active:bg-brand-active shadow-sm",
        secondary:
          "bg-surface text-ink-primary border border-divider hover:bg-surface-inset active:scale-[0.98]",
        ghost: "bg-transparent text-ink-primary hover:bg-surface-inset",
        link: "bg-transparent text-ink-primary underline-offset-4 hover:underline px-0 py-0",
      },
      size: {
        default: "px-6 py-4 text-body",
        sm: "px-4 py-2.5 text-meta",
        lg: "px-7 py-4 text-card",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [bouncing, setBouncing] = useState(false);

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (!props.disabled && (variant === "primary" || variant == null)) {
        setBouncing(true);
        setTimeout(() => setBouncing(false), 400);
      }
      (onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(e);
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          bouncing && "animate-btn-bounce",
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
