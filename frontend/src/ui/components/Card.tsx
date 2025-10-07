import React from "react";
import clsx from "clsx";

export const Card: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div
      className={clsx("bg-surface-100 p-4 rounded-xl shadow-card", className)}
    >
      {children}
    </div>
  );
};

export default Card;
