// frontend/src/ui/components/Modal.tsx
import React, { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = "md",
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-start justify-center p-4 pt-8 sm:pt-12 md:pt-16">
        <div
          className={`
            relative bg-white rounded-lg shadow-xl 
            w-full ${sizeClasses[size]}
            transform transition-all
            max-h-[90vh] overflow-y-auto
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || true) && (
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                {title && (
                  <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-default)] pr-8">
                    {title}
                  </h2>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                  aria-label="Fechar"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-4 py-4 sm:px-6 sm:py-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
