import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { InstallHint } from "./InstallHint";
import { isIos } from "../domain/pwa";

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36";

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

describe("isIos", () => {
  it("detecta iPhone e iPad (inclusive iPadOS como Macintosh com touch)", () => {
    expect(isIos(IPHONE_UA)).toBe(true);
    expect(isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5)).toBe(
      true,
    );
    expect(isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0)).toBe(
      false,
    );
    expect(isIos(ANDROID_UA)).toBe(false);
  });
});

describe("InstallHint", () => {
  const originalUA = window.navigator.userAgent;

  beforeEach(() => localStorage.clear());
  afterEach(() => setUserAgent(originalUA));

  it("no iPhone explica o caminho pelo Compartilhar", () => {
    setUserAgent(IPHONE_UA);
    render(<InstallHint />);
    expect(screen.getByText(/Adicionar à Tela de Início/)).toBeInTheDocument();
  });

  it("no Android só aparece quando o navegador oferece a instalação", async () => {
    setUserAgent(ANDROID_UA);
    render(<InstallHint />);
    expect(screen.queryByText("Instale o JudoTracker")).not.toBeInTheDocument();

    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    act(() => {
      window.dispatchEvent(event);
    });

    fireEvent.click(await screen.findByRole("button", { name: "Instalar" }));
    expect(prompt).toHaveBeenCalled();
  });

  it("fecha e não volta depois de dispensado", () => {
    setUserAgent(IPHONE_UA);
    const { unmount } = render(<InstallHint />);
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByText("Instale o JudoTracker")).not.toBeInTheDocument();
    unmount();
    render(<InstallHint />);
    expect(screen.queryByText("Instale o JudoTracker")).not.toBeInTheDocument();
  });
});
