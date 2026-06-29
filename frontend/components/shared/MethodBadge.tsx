import React from "react";
import clsx from "clsx";

interface MethodBadgeProps {
  method: string;
  size?: "sm" | "md";
}

export default function MethodBadge({ method, size = "md" }: MethodBadgeProps) {
  const m = method?.toUpperCase() || "GET";

  const colorClasses = {
    GET: "text-method-get bg-method-get/10",
    POST: "text-method-post bg-method-post/10",
    PUT: "text-method-put bg-method-put/10",
    PATCH: "text-method-patch bg-method-patch/10",
    DELETE: "text-method-delete bg-method-delete/10",
  }[m] || "text-text-secondary bg-border/20";

  return (
    <span
      className={clsx(
        "rounded font-mono font-bold uppercase tracking-wider inline-flex items-center justify-center",
        size === "sm" ? "text-[9px] px-1 py-0.5 leading-none" : "text-[11px] px-1.5 py-0.5",
        colorClasses
      )}
    >
      {m}
    </span>
  );
}
