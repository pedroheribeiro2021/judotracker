// frontend/src/ui/components/Modal.tsx
import React from "react";
import ReactDOM from "react-dom";
import clsx from "clsx";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export const Modal: React.FC<Props> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 z-10 w-full max-w-2xl shadow-card">
        <div className="flex items-start justify-between mb-4">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : <div />}
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="ml-4 inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
          >
            {/* simple X icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10 3.636 5.05A1 1 0 015.05 3.636L10 8.586z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
