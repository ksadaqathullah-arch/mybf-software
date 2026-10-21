"use client";

import { useState } from "react";
import { site } from "@/lib/site";

const roles = [
  "Startup founder",
  "Business owner",
  "Student with a business idea",
  "Professional or mentor",
  "Investor",
  "Something else",
];

type Errors = Partial<Record<"name" | "phone" | "role", string>>;

const field =
  "min-h-12 w-full border-0 border-b-2 border-ink/25 bg-transparent px-0 py-2 text-lg text-ink placeholder:text-muted/70 focus:border-blue focus:outline-none";

export function JoinForm() {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role") ?? "");
    const business = String(data.get("business") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const nextErrors: Errors = {};
    if (!name) nextErrors.name = "We need a name.";
    if (!/^[\d\s+()-]{8,}$/.test(phone)) nextErrors.phone = "A number we can actually ring.";
    if (!role) nextErrors.role = "Pick the closest fit.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = (Object.keys(nextErrors) as Array<keyof Errors>)[0];
      document.getElementById(first)?.focus();
      return;
    }

    const lines = [
      "Hello MYBF — I'd like to join the forum.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      `I am a: ${role}`,
      business ? `Business: ${business}` : null,
      message ? `Note: ${message}` : null,
    ].filter(Boolean);

    window.open(
      `https://wa.me/${site.phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <Field id="name" label="Name" required error={errors.name}>
        <input id="name" name="name" type="text" autoComplete="name" className={field} />
      </Field>
      <Field id="phone" label="Phone / WhatsApp" required error={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={field}
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="email" label="Email" hint="if you have one">
          <input id="email" name="email" type="email" autoComplete="email" className={field} />
        </Field>
        <Field id="role" label="I am" required error={errors.role}>
          <select id="role" name="role" defaultValue="" className={`${field} appearance-none`}>
            <option value="" disabled>
              Choose
            </option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field id="business" label="What are you building" hint="optional">
        <input id="business" name="business" type="text" className={field} />
      </Field>
      <Field id="message" label="Anything we should know" hint="optional">
        <textarea id="message" name="message" rows={4} className={`${field} min-h-28 resize-y`} />
      </Field>

      <button
        type="submit"
        className="inline-flex min-h-12 w-fit items-center bg-ink px-6 font-display text-sm font-extrabold tracking-[0.14em] text-paper uppercase hover:bg-blue max-sm:w-full max-sm:justify-center"
      >
        Send on WhatsApp
      </button>
      <p className="max-w-md text-base leading-relaxed text-muted">
        This opens WhatsApp with the note filled in. Nothing is stored on the site. Or write
        directly to{" "}
        <a href={`mailto:${site.email}`} className="text-ink underline decoration-yellow decoration-2 underline-offset-4">
          {site.email}
        </a>
        .
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-display text-[0.72rem] font-bold tracking-[0.16em] uppercase">
        {label}
        {required ? <span className="text-magenta"> *</span> : null}
        {hint ? <span className="ml-2 font-serif text-sm font-normal tracking-normal text-muted normal-case">{hint}</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-base text-magenta">
          {error}
        </p>
      ) : null}
    </div>
  );
}
