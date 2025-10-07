// frontend/src/ui/components/Input.tsx
import React from "react";
import clsx from "clsx";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

// use forwardRef to accept refs from react-hook-form register
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...rest }, ref) => {
    return (
      <label className="block">
        {label && (
          <span className="block text-sm mb-1 text-text-muted">{label}</span>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-100",
            error ? "border-danger-500" : "border-gray-200",
            className
          )}
          {...rest}
        />
        {error && <div className="text-sm text-danger-500 mt-1">{error}</div>}
      </label>
    );
  }
);

Input.displayName = "Input";

export default Input;
