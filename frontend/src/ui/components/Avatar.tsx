import React from "react";
import clsx from "clsx";

export const Avatar: React.FC<{
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}> = ({ src, alt, size = "md" }) => {
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-16 h-16" };
  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center rounded-full overflow-hidden bg-surface-200",
        sizes[size]
      )}
    >
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span className="text-muted-500">{(alt ?? "U").slice(0, 1)}</span>
      )}
    </div>
  );
};
