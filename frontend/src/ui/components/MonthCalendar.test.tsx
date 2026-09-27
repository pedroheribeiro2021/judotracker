import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MonthCalendar } from "./MonthCalendar";

// Mês fixo no passado para não depender de "hoje".
const MARCH_2026 = new Date(2026, 2, 1);

function renderCalendar(
  props: Partial<Parameters<typeof MonthCalendar>[0]> = {},
) {
  return render(
    <MonthCalendar
      month={MARCH_2026}
      onMonthChange={vi.fn()}
      events={[
        {
          id: "c1",
          date: new Date(2026, 2, 14, 9),
          title: "Copa Teste",
          subtitle: "Estadual · São Paulo/SP",
        },
        {
          id: "deadline:c1",
          date: new Date(2026, 2, 7),
          title: "Prazo: Copa Teste",
          tone: "danger",
        },
      ]}
      {...props}
    />,
  );
}

describe("MonthCalendar", () => {
  it("mostra o mês em português e a semana começando na segunda", () => {
    renderCalendar();
    expect(screen.getByText("Março de 2026")).toBeInTheDocument();
    const headers = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    headers.forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
  });

  it("lista os eventos do dia selecionado", () => {
    renderCalendar();
    fireEvent.click(screen.getByRole("button", { name: "14 de março" }));
    expect(screen.getByText("Sábado, 14 de março")).toBeInTheDocument();
    expect(screen.getByText("Estadual · São Paulo/SP")).toBeInTheDocument();
  });

  it("mostra estado vazio em dia sem eventos", () => {
    renderCalendar();
    fireEvent.click(screen.getByRole("button", { name: "10 de março" }));
    expect(screen.getByText("Nada agendado neste dia.")).toBeInTheDocument();
  });

  it("chama onEventClick com o id do evento", () => {
    const onEventClick = vi.fn();
    renderCalendar({ onEventClick });
    fireEvent.click(screen.getByRole("button", { name: "7 de março" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Último|Prazo: Copa Teste/ }),
    );
    expect(onEventClick).toHaveBeenCalledWith("deadline:c1");
  });

  it("navega entre meses", () => {
    const onMonthChange = vi.fn();
    renderCalendar({ onMonthChange });
    fireEvent.click(screen.getByLabelText("Próximo mês"));
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 3, 1));
  });
});
