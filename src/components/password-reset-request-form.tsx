import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { APP_NAME } from "@/lib/constants";
import { SubmitButton } from "@/components/submit-button";

type PasswordResetRequestFormProps = {
  message?: string;
  success?: string;
};

export function PasswordResetRequestForm({ message, success }: PasswordResetRequestFormProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card-shadow soft-ring w-full max-w-md rounded-[28px] border border-line bg-surface p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-muted">Password recovery</p>
          <h1 className="text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm leading-6 text-muted">
            Enter your email and we&apos;ll send you a reset link for your account.
          </p>
        </div>

        <form action={requestPasswordResetAction} className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none transition focus:border-accent"
              placeholder="you@example.com"
            />
          </label>

          {message ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
          ) : null}

          {success ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <SubmitButton className="w-full">Send reset link</SubmitButton>
        </form>

        <p className="mt-6 text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
