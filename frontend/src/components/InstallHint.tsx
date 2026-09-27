// frontend/src/components/InstallHint.tsx
// Convite para instalar o app na tela inicial.
// - Android/Chrome: usa o evento `beforeinstallprompt` e mostra "Instalar".
// - iPhone/Safari: não existe prompt; explica o caminho pelo Compartilhar.
import React, { useEffect, useState } from "react";
import {
  dismissInstallHint,
  isIos,
  isStandalone,
  wasInstallHintDismissed,
} from "../domain/pwa";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const InstallHint: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(
    null,
  );
  const [hidden, setHidden] = useState(
    () => isStandalone() || wasInstallHintDismissed(),
  );
  const ios = isIos(navigator.userAgent, navigator.maxTouchPoints);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || (!ios && !installEvent)) return null;

  const close = () => {
    dismissInstallHint();
    setHidden(true);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setHidden(true);
    setInstallEvent(null);
  };

  return (
    <div
      role="dialog"
      aria-label="Instalar o JudoTracker"
      className="fixed inset-x-3 z-40 mx-auto max-w-md rounded-xl bg-white shadow-card border border-gray-200 p-4 flex items-start gap-3"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <img
        src="/pwa-192x192.png"
        alt=""
        className="w-10 h-10 rounded-lg shrink-0"
      />
      <div className="text-sm flex-1 min-w-0">
        <div className="font-semibold text-gray-900">Instale o JudoTracker</div>
        {ios ? (
          <p className="text-text-muted mt-0.5">
            No Safari, toque em <strong>Compartilhar</strong> e depois em{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </p>
        ) : (
          <p className="text-text-muted mt-0.5">
            Abra direto da tela inicial, em tela cheia.
          </p>
        )}
        {!ios && (
          <button
            type="button"
            onClick={install}
            className="mt-2 px-3 py-1.5 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
          >
            Instalar
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Fechar"
        className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
      >
        ×
      </button>
    </div>
  );
};
