"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { clsx } from "@/lib/clsx";

const projectTypes = [
  "Real estate listing",
  "Twilight / exterior",
  "Drone / aerial",
  "Listing video",
  "3D / virtual tour",
  "Ongoing / volume",
  "Something else",
];

export function InquireButton({
  companySlug,
  companyName,
}: {
  companySlug: string;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    projectType: projectTypes[0],
    message: "",
  });

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companySlug, ...form }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setDone(false);
      setForm({ name: "", email: "", projectType: projectTypes[0], message: "" });
    }, 200);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Inquire / Hire</Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-ink-700 bg-ink-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-300">
                  ✓
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  Inquiry sent
                </h3>
                <p className="mt-2 text-sm text-bone/60">
                  {companyName} has been notified, and it&apos;s logged in the{" "}
                  Photographylink inbox. They&apos;ll reach out at{" "}
                  <span className="text-bone/80">{form.email}</span>.
                </p>
                <Button className="mt-6" onClick={close}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-xl font-semibold">
                  Inquire with {companyName}
                </h3>
                <p className="mt-1 text-sm text-bone/55">
                  Tell them about your shoot. Both {companyName} and our team
                  get notified.
                </p>
                <div className="mt-5 space-y-3">
                  <Field label="Your name">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jordan Rivera"
                      className="input"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="input"
                    />
                  </Field>
                  <Field label="Project type">
                    <select
                      value={form.projectType}
                      onChange={(e) =>
                        setForm({ ...form, projectType: e.target.value })
                      }
                      className="input"
                    >
                      {projectTypes.map((t) => (
                        <option key={t} value={t} className="bg-ink-800">
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Details">
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      rows={3}
                      placeholder="Address, timing, what you need shot…"
                      className="input resize-none"
                    />
                  </Field>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={close}
                    className="rounded-full px-4 py-2 text-sm text-bone/60 hover:text-bone"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={submit}
                    disabled={busy || !form.name || !form.email}
                  >
                    {busy ? "Sending…" : "Send inquiry"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
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
