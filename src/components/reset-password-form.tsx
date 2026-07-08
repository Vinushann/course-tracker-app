import Link from "next/link";
import { updatePasswordAction } from "@/app/actions/auth";
import { APP_NAME } from "@/lib/constants";
import { SubmitButton } from "@/components/submit-button";

type ResetPasswordFormProps = {
  message?: string;
  success?: string;
};

export function ResetPasswordForm({ message, success }: ResetPasswordFormProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="soft-ring w-full max-w-md rounded-xl border border-line bg-surface p-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-muted">Choose a new password</p>
          <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm leading-6 text-muted">
            Set a new password for your account, then use it to log back in.
          </p>
        </div>

        <form action={updatePasswordAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">New password</span>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-line bg-background/30 px-4 py-3 outline-none transition focus:border-accent"
              placeholder="Minimum 6 characters"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Confirm password</span>
            <input
              type="password"
              name="confirm_password"
              required
              minLength={6}
              className="w-full rounded-lg border border-line bg-background/30 px-4 py-3 outline-none transition focus:border-accent"
              placeholder="Repeat your new password"
            />
          </label>

          {message ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
          ) : null}

          {success ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <SubmitButton className="w-full">Update password</SubmitButton>
        </form>

        <p className="mt-6 text-sm text-muted">
          Back to{" "}
          <Link href="/login" className="font-semibold text-accent">
            login
          </Link>
        </p>
      </div>
    </div>
  );
}
