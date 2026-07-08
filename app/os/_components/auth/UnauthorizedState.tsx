"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { OWNER_EMAIL } from "../../_lib/config";
import { AuthFrame } from "./AuthFrame";

export function UnauthorizedState({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => void;
}) {
  return (
    <AuthFrame
      icon={ShieldCheck}
      title="Owner only"
      subtitle={`このOSは${OWNER_EMAIL}専用です。現在のログイン: ${email}`}
    >
      <button
        type="button"
        onClick={onSignOut}
        className="btn-secondary justify-center"
      >
        <LogOut size={16} aria-hidden="true" />
        Sign out
      </button>
    </AuthFrame>
  );
}
