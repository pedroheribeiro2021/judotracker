import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";
import { useAuth } from "../contexts/AuthContext";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("LoginForm", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("chama signIn com o email e a senha digitados", async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      signIn,
      signOut: vi.fn(),
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "coach@mail.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(signIn).toHaveBeenCalledWith("coach@mail.com", "senha123");
  });

  it("mostra a mensagem de erro quando signIn falha", async () => {
    const signIn = vi.fn().mockRejectedValue(new Error("Credenciais inválidas"));
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      signIn,
      signOut: vi.fn(),
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "coach@mail.com");
    await userEvent.type(screen.getByLabelText("Senha"), "errada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Credenciais inválidas")).toBeInTheDocument();
  });
});
