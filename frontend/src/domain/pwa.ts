// frontend/src/domain/pwa.ts

/** iPhone/iPad. O iPadOS 13+ se apresenta como "Macintosh", mas tem touch. */
export function isIos(userAgent: string, maxTouchPoints = 0): boolean {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

/** O app já está aberto como aplicativo instalado (tela cheia). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true
  );
}

const DISMISS_KEY = "jt.installHint.dismissed";

export function wasInstallHintDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallHint(): void {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // sem storage (aba anônima): a dica só volta na próxima visita
  }
}
