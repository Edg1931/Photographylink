"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { clsx } from "@/lib/clsx";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const isSignup = mode === "signup";
  const [role, setRole] = useState<"company" | "photographer">("company");
  const [form, setForm] = useState({
    displayName: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(isSignup ? { ...form, role } : { email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        window.location.href = data.redirect ?? "/dashboard";
      } else {
        setError(data.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-ink-700 bg-ink-900 p-8">
      <h1 className="font-display text-2xl font-semibold">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-bone/55">
        {isSignup
          ? "Set up your profile and start posting or claiming work."
          : "Sign in to your dashboard."}
      </p>

      {isSignup && (
        <div className="mt-6 grid grid-cols-2 gap-2">
          {(["company", "photographer"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={clsx(
                "rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                role === r
                  ? "border-amber-brand/50 bg-amber-brand/10"
                  : "border-ink-600 hover:border-ink-500",
              )}
            >
              <span className="block font-semibold text-bone">
                {r === "company" ? "I run a company" : "I'm a photographer"}
              </span>
              <span className="mt-0.5 block text-xs text-bone/50">
                {r === "company"
                  ? "Post jobs, build a bench"
                  : "Find freelance work"}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {isSignup && (
          <>
            <Field label="Your name">
              <input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Jordan Rivera"
                className="input"
              />
            </Field>
            {role === "company" && (
              <Field label="Company name">
                <input
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  placeholder="Rivera Real Estate Media"
                  className="input"
                />
              </Field>
            )}
          </>
        )}
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="input"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="input"
          />
        </Field>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <Button
        className="mt-6 w-full"
        onClick={submit}
        disabled={busy || !form.email || !form.password}
      >
        {busy ? "…" : isSignup ? "Create account" : "Sign in"}
      </Button>

      <p className="mt-4 text-center text-sm text-bone/55">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-amber-soft hover:text-amber-brand"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>

      <p className="mt-4 rounded-lg bg-ink-950 px-3 py-2 text-center text-[11px] text-bone/40">
        Demo auth — accounts live in server memory and reset when the server
        restarts. Real auth arrives with the Supabase backend.
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-bone/45">
        {label}
      </span>
      {children}
    </label>
  );
}
