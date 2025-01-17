import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-sans font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        destructive:
          "bg-delete-red text-white hover:bg-red-800 dark:bg-delete-red dark:text-slate-50 dark:hover:bg-red-900/90",
        outline:
          "border border-blue-primary border-[1px] text-blue-primary bg-white hover:bg-blue-primary hover:text-white dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        primary:
          "bg-blue-primary text-white hover:bg-[#2b61bb] dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        ghost:
          "hover:bg-[#e5f0ff] hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
        mainblue:
          "border border-blue-primary transition-opacity border-[1px] bg-blue-primary text-white hover:opacity-75 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        outline2:
          "border-2 border-[1px] transition-bg border-blue-primary text-blue-primary bg-white hover:bg-gray-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        mainorange:
          "border border-orange-primary transition-opacity border-[1px] bg-orange-primary text-white hover:opacity-80 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        white: "text-blue-primary",
        gray: "border border-gray-100 transition-opacity border-[1px] bg-white text-neutral-600 shadow hover:opacity-80 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        upload:
          "bg-[#FAFBFC] border border-[#666666] text-slate-900 hover:opacity-80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        "pagination-outline":
          "border-[1.5px] font-semibold border-orange-primary text-orange-primary rounded-md hover:cursor-pointer bg-white hover:bg-orange-50",
        "pagination-ghost":
          "border-[1.5px] font-semibold rounded-md hover:cursor-pointer hover:bg-neutral-100 hover:text-slate-900 disabled:bg-red-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
