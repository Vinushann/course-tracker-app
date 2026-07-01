import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { APP_NAME } from "@/lib/constants";
import { SubmitButton } from "@/components/submit-button";

type AppSidebarProps = {
  email: string;
};

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
];

export function AppSidebar({ email }: AppSidebarProps) {
  return (
    <aside className="soft-ring card-shadow flex w-full max-w-sm flex-col gap-6 rounded-[28px] border border-line bg-surface p-6 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-w-[280px]">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Focus system</p>
        <h1 className="text-2xl font-semibold">{APP_NAME}</h1>
        <p className="text-sm text-muted">{email}</p>
      </div>

      <nav className="grid gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-muted transition hover:border-line hover:bg-surface-strong hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl bg-accent-soft p-4 text-sm leading-6 text-foreground/80">
        Keep lessons tiny, updates accurate, and your dashboard honest.
      </div>

      <form action={logoutAction}>
        <SubmitButton className="w-full bg-foreground text-background">Log Out</SubmitButton>
      </form>
    </aside>
  );
}
