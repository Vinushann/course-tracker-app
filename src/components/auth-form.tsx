import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { SubmitButton } from "@/components/submit-button";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<void>;
  message?: string;
  success?: string;
};

export function AuthForm({ mode, action, message, success }: AuthFormProps) {
  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="soft-ring w-full max-w-md rounded-xl border border-line bg-surface p-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-muted">Discipline tracker</p>
          <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm leading-6 text-muted">
            {isLogin
              ? "Log in to review your learning streaks, completed time, and course progress."
              : "Create your account and start tracking lessons, sections, and course progress."}
          </p>
        </div>

        <form action={action} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-line bg-background/30 px-4 py-3 outline-none transition focus:border-accent"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-line bg-background/30 px-4 py-3 outline-none transition focus:border-accent"
              placeholder="Minimum 6 characters"
            />
          </label>

          {isLogin ? (
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-medium text-accent">
                Forgot password?
              </Link>
            </div>
          ) : null}

          {message ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
          ) : null}

          {success ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <SubmitButton className="w-full">{isLogin ? "Log In" : "Create Account"}</SubmitButton>
        </form>

        <p className="mt-6 text-sm text-muted">
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-accent">
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
