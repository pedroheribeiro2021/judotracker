// frontend/src/components/OfflineBanner.tsx
// As telas abrem sem internet (service worker), mas os dados vêm do servidor.
// Em vez de erros soltos, avisa que a conexão caiu.
import React, { useEffect, useState } from "react";

export const OfflineBanner: React.FC = () => {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="sticky z-50 bg-gray-900 text-white text-sm text-center px-4 py-2"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      Sem conexão. Os dados voltam a carregar quando a internet voltar.
    </div>
  );
};
