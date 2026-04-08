import React from "react";
import clsx from "clsx";

export const Badge: React.FC<{
  children?: React.ReactNode;
  variant?: "default" | "success" | "danger";
}> = ({ children, variant = "default" }) => {
  const v = {
    default: "bg-surface-200 text-text-muted",
    success: "bg-success-500 text-white",
    danger: "bg-danger-500 text-white",
  }[variant];
  return (
    <span className={clsx("inline-block text-sm px-2 py-0.5 rounded-full", v)}>
      {children}
    </span>
  );
};
