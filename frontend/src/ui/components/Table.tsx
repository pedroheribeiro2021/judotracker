import React from "react";

export const Table: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div className={className}>
      <table className="w-full table-auto border-collapse text-left">
        {children}
      </table>
    </div>
  );
};
