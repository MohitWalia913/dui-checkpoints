"use client";

import { cn } from "@/lib/utils";
import { authInputClassName, authLabelClassName } from "@/components/auth/auth-ui";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";

type FieldIcon = "email" | "password";

const ICONS: Record<FieldIcon, typeof Mail> = {
  email: Mail,
  password: Lock,
};

export function AuthField({
  id,
  label,
  labelAction,
  type = "text",
  icon,
  showPasswordToggle,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  label: string;
  labelAction?: React.ReactNode;
  icon?: FieldIcon;
  showPasswordToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const Icon = icon ? ICONS[icon] : null;
  const inputType =
    showPasswordToggle && type === "password"
      ? visible
        ? "text"
        : "password"
      : type;

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={authLabelClassName}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9AA3AF]"
            aria-hidden
          />
        ) : null}
        <input
          id={id}
          type={inputType}
          className={cn(authInputClassName, Icon && "pl-11", showPasswordToggle && "pr-11")}
          {...props}
        />
        {showPasswordToggle && type === "password" ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9AA3AF] transition-colors hover:text-[#040F20]"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
