import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:bg-border",
  secondary: "bg-surface text-ink border border-border hover:bg-border/40",
  ghost: "text-primary hover:bg-surface",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-border",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
