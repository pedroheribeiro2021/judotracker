import React from "react";

export const FormRow: React.FC<React.PropsWithChildren<{ label?: string }>> = ({
  label,
  children,
}) => {
  return (
    <div className="mb-4">
      {label && <div className="mb-2 text-sm text-text-muted">{label}</div>}
      <div>{children}</div>
    </div>
  );
};
