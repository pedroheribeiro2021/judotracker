import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { startOfWeek, endOfWeek } from "date-fns";
import Trainings from "./Trainings";
import { GET_TRAINING_SESSIONS } from "../graphql/queries";

// A página calcula a semana a partir de `new Date()` no momento da
// renderização; reproduzimos o mesmo cálculo aqui em vez de mockar o
// relógio do sistema (fake timers travam a resolução assíncrona do
// MockedProvider/waitFor).
const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

function renderPage(mocks: MockedResponse[]) {
  return render(
    <MemoryRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Trainings />
      </MockedProvider>
    </MemoryRouter>,
  );
}

describe("Trainings", () => {
  it("lista as sessões da semana atual", async () => {
    const sessionsMock: MockedResponse = {
      request: {
        query: GET_TRAINING_SESSIONS,
        variables: { from: weekStart.toISOString(), to: weekEnd.toISOString() },
      },
      result: {
        data: {
          trainingSessions: [
            {
              id: "session-1",
              date: weekStart.toISOString(),
              type: "RANDORI",
              durationMinutes: 90,
              notes: "Foco em newaza",
              attendances: [{ id: "a1", athleteId: "athlete-1", present: true }],
            },
          ],
        },
      },
    };

    renderPage([sessionsMock]);

    expect(await screen.findByText("Randori")).toBeInTheDocument();
    expect(screen.getByText(/90 min/)).toBeInTheDocument();
    expect(screen.getByText(/1 presentes/)).toBeInTheDocument();
  });

  it("mostra estado vazio quando não há sessões na semana", async () => {
    const emptyMock: MockedResponse = {
      request: {
        query: GET_TRAINING_SESSIONS,
        variables: { from: weekStart.toISOString(), to: weekEnd.toISOString() },
      },
      result: { data: { trainingSessions: [] } },
    };

    renderPage([emptyMock]);

    expect(
      await screen.findByText("Nenhuma sessão de treino nesta semana."),
    ).toBeInTheDocument();
  });
});
