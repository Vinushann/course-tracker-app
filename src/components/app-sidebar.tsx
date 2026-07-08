"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { APP_NAME } from "@/lib/constants";

type AppSidebarProps = {
  email: string;
};

const links = [
  { href: "/dashboard", label: "Dashboard", caption: "Overview and daily totals" },
  { href: "/courses", label: "Courses", caption: "Create and track lessons" },
];

export function AppSidebar({ email }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="soft-ring card-shadow flex w-full max-w-sm flex-col gap-6 rounded-[24px] border border-line bg-surface p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-w-[280px]">
      <div className="space-y-3 border-b border-line pb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Project space</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight">{APP_NAME}</h1>
        </div>
        <p className="text-sm text-muted">{email}</p>
      </div>

      <nav className="grid gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[18px] border px-4 py-3 transition ${
                isActive
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-transparent text-muted hover:border-line hover:bg-surface-strong hover:text-foreground"
              }`}
            >
              <p className="text-sm font-semibold">{link.label}</p>
              <p className="mt-1 text-xs text-muted">{link.caption}</p>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-[18px] border border-line bg-surface-strong/60 p-4 text-sm leading-6 text-muted">
        Build the course once. Track the lessons daily. Keep the screen quiet enough that your next action stays obvious.
      </div>

      <form action={logoutAction} className="mt-auto">
        <SubmitButton className="w-full" variant="dark">
          Log Out
        </SubmitButton>
      </form>
    </aside>
  );
}
