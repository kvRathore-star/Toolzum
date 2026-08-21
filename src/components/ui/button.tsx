import React, { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary: "bg-[var(--accent-ink)] text-white hover:bg-[var(--accent-hover)] shadow-md hover:shadow-[var(--shadow-glow-accent)] hover:scale-[1.02]",
      secondary: "border border-[var(--border-default)] bg-transparent hover:bg-[var(--bg-surface)] text-[var(--text-primary)]",
      ghost: "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]",
      danger: "bg-[var(--danger)] text-white hover:opacity-90 shadow-sm",
      icon: "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] aspect-square",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-[var(--radius-md)]",
      md: "h-11 px-5 text-sm rounded-[var(--radius-full)]",
      lg: "h-13 px-8 text-base rounded-[var(--radius-full)]",
      icon: "h-9 w-9 rounded-md",
    };

    const compSize = variant === "icon" ? sizes.icon : sizes[size];
    const styles = cn(baseStyles, variants[variant], compSize, className);

    if (asChild && isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;
      return cloneElement(children, {
        className: cn(styles, childProps.className as string | undefined),
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={ref}
        className={styles}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";