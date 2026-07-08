"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAME } from "@/lib/constants";

type AppSidebarProps = {
  email: string;
};

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    caption: "Overview and daily totals",
    icon: LayoutDashboard,
  },
  {
    href: "/courses",
    label: "Courses",
    caption: "Create and track lessons",
    icon: BookOpen,
  },
];

export function AppSidebar({ email }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="soft-ring flex w-full max-w-sm flex-col gap-5 rounded-xl border border-line bg-surface p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-w-[280px]">
      <div className="space-y-3 border-b border-line pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
            Project space
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {APP_NAME}
          </h1>
        </div>
        <p className="text-sm text-muted">{email}</p>
      </div>

      <nav className="grid gap-2">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg border px-3 py-3 transition ${
                isActive
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-transparent text-muted hover:border-line hover:bg-surface-strong hover:text-foreground"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="mt-1 text-xs text-muted">{link.caption}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-line bg-background/20 p-3 text-sm leading-6 text-muted">
        Build the course once. Track the lessons daily. Keep the screen quiet
        enough that your next action stays obvious.
      </div>

      <ThemeToggle />

      <form action={logoutAction} className="mt-auto">
        <SubmitButton className="w-full" variant="dark">
          <LogOut className="mr-2 h-4 w-4" aria-hidden />
          Log Out
        </SubmitButton>
      </form>
    </aside>
  );
}
