"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "accent" | "outline" | "light" | "dark";
};

const variantClasses: Record<NonNullable<SubmitButtonProps["variant"]>, string> = {
  accent: "bg-accent text-[#0f1412]",
  outline: "border border-line bg-transparent text-foreground",
  light: "bg-[#eef2f5] text-[#101317]",
  dark: "bg-surface-strong text-foreground border border-line",
};

export function SubmitButton({ children, className, variant = "accent" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
    >
      {pending ? "Saving..." : children}
    </button>
  );
}
