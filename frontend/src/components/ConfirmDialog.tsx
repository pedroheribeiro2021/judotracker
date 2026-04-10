// frontend/src/components/ConfirmDialog.tsx
import React from "react";
import { Modal } from "../ui/components/Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
};

export const ConfirmDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Excluir",
  cancelText = "Cancelar",
  isLoading = false,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-[var(--text-default)]">{message}</p>
        <div className="flex gap-2 pt-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-[var(--danger-500)] hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 font-medium"
          >
            {isLoading ? "Excluindo..." : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-[var(--surface-200)] hover:bg-gray-300 text-[var(--text-default)] py-2 px-4 rounded-md transition duration-200"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
