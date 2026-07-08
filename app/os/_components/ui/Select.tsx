"use client";

import { useId } from "react";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

// 9箇所の <select> 重複の置換先。labelが無いときはariaLabel必須（呼び出し側で担保）。
export function Select<T extends string = string>({
  label,
  ariaLabel,
  id,
  value,
  onChange,
  options,
  disabled,
}: {
  label?: string;
  ariaLabel?: string;
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const select = (
    <select
      id={selectId}
      aria-label={label ? undefined : ariaLabel}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as T)}
      className="h-8 rounded-lg px-2 text-xs"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!label) {
    return select;
  }

  return (
    <div>
      <label
        htmlFor={selectId}
        className="text-xs block mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {select}
    </div>
  );
}
