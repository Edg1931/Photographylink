"use client";

import { useState } from "react";
import { Button, ButtonVariant } from "@/components/ui";
import { fileToResizedDataUrl } from "@/lib/resizeImage";

export function ApplyButton({
  companySlug,
  companyName,
  variant = "primary",
}: {
  companySlug: string;
  companyName: string;
  variant?: ButtonVariant;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sample, setSample] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gear: "",
    experience: "",
  });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSample(await fileToResizedDataUrl(file));
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/companies/${companySlug}/apply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, sampleUrl: sample || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.ok) setDone(true);
      else setError(data.error ?? "Could not submit application");
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setDone(false);
      setError("");
      setSample("");
      setForm({ name: "", email: "", phone: "", gear: "", experience: "" });
    }, 200);
  };

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        Apply to shoot
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-300">
                  ✓
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  Application sent
                </h3>
                <p className="mt-2 text-sm text-bone/60">
                  {companyName} will review your work and get back to you. Once
                  they approve you, you&apos;ll be able to claim their shoots.
                </p>
                <Button className="mt-6" onClick={close}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-xl font-semibold">
                  Apply to shoot for {companyName}
                </h3>
                <p className="mt-1 text-sm text-bone/55">
                  Tell them about your gear and experience, and show one example
                  of your work. They approve you before you join their bench.
                </p>
                <div className="mt-5 space-y-3">
                  <Field label="Your name">
                    <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Email">
                      <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                    </Field>
                    <Field label="Phone (optional)">
                      <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="512-555-0100" />
                    </Field>
                  </div>
                  <Field label="What camera / gear do you shoot with?">
                    <input className="input" value={form.gear} onChange={(e) => setForm({ ...form, gear: e.target.value })} placeholder="Sony A7 IV, 16-35 GM, DJI Mavic 3…" />
                  </Field>
                  <Field label="Your experience">
                    <textarea className="input resize-none" rows={2} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 3 years shooting real estate, 200+ listings…" />
                  </Field>
                  <Field label="A sample of your work">
                    {sample ? (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sample} alt="Work sample" className="h-40 w-full rounded-lg object-cover" />
                        <button onClick={() => setSample("")} className="absolute right-2 top-2 rounded-full bg-ink-950/80 px-2 py-1 text-xs text-bone">Change</button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-ink-600 bg-ink-950 py-6 text-sm text-bone/55 hover:border-amber-brand/50">
                        📷 Tap to upload a photo
                        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                      </label>
                    )}
                  </Field>
                </div>
                {error && (
                  <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
                )}
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={close} className="rounded-full px-4 py-2 text-sm text-bone/60 hover:text-bone">Cancel</button>
                  <Button onClick={submit} disabled={busy || !form.name || !form.email}>
                    {busy ? "Sending…" : "Send application"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-bone/45">
        {label}
      </span>
      {children}
    </label>
  );
}
