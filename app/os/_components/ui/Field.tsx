"use client";

import { cloneElement, isValidElement, useId, type ReactElement } from "react";

export function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id?: string;
  hint?: string;
  children: ReactElement<{ id?: string }>;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const input = isValidElement(children)
    ? cloneElement(children, { id: fieldId })
    : children;

  return (
    <div>
      <label htmlFor={fieldId} className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      {input}
      {hint && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
