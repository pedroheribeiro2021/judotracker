import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import AthletePage from "./AthletePage";
import { GET_ATHLETE, GET_ATHLETE_STATS, GET_WEIGHINS } from "../graphql/queries";

function renderPage(mocks: MockedResponse[]) {
  return render(
    <MemoryRouter initialEntries={["/athletes/athlete-1"]}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Routes>
          <Route path="/athletes/:id" element={<AthletePage />} />
        </Routes>
      </MockedProvider>
    </MemoryRouter>,
  );
}

const athleteMock: MockedResponse = {
  request: { query: GET_ATHLETE, variables: { id: "athlete-1" } },
  result: {
    data: {
      athlete: {
        id: "athlete-1",
        dob: "1998-05-10",
        sex: "M",
        heightCm: 175,
        defaultWeightKg: 73,
        ageDivision: "SENIOR",
        currentWeightClass: "-73",
        lastWeighInKg: 73,
        currentBelt: "BLACK_1DAN",
        user: { id: "user-1", email: "joao@example.com", name: "João Silva" },
        coach: null,
        createdAt: "2025-01-01T00:00:00.000Z",
        entries: [
          {
            id: "entry-1",
            weightClass: "-73",
            result: null,
            rank: null,
            finalPosition: 3,
            medal: "BRONZE",
            competition: {
              id: "comp-1",
              name: "Copa São Paulo de Judô",
              date: "2025-08-20T00:00:00.000Z",
              location: "Ginásio do Ibirapuera",
              level: "ESTADUAL",
            },
          },
        ],
      },
    },
  },
};

const weighInsMock: MockedResponse = {
  request: { query: GET_WEIGHINS, variables: { athleteId: "athlete-1" } },
  result: { data: { weighIns: [] } },
};

const statsMock: MockedResponse = {
  request: { query: GET_ATHLETE_STATS, variables: { athleteId: "athlete-1" } },
  result: {
    data: {
      athleteStats: {
        totalMatches: 3,
        wins: 2,
        losses: 1,
        draws: 0,
        winRate: 66.7,
        ipponWins: 1,
        avgShidosPerMatch: 1,
        scoreTypeDistribution: [{ scoreType: "IPPON", count: 1 }],
        winsByScoreType: [{ scoreType: "IPPON", count: 1 }],
        topTechniques: [{ technique: "seoi-nage", wins: 1 }],
        medalsByType: [{ medal: "BRONZE", count: 1 }],
        performanceByWeightClass: [
          { weightClass: "-73", entries: 1, wins: 2, losses: 1 },
        ],
      },
    },
  },
};

describe("AthletePage", () => {
  it("mostra o header do atleta e os KPIs de estatísticas", async () => {
    renderPage([athleteMock, statsMock, weighInsMock]);

    expect(await screen.findByText("João Silva")).toBeInTheDocument();
    expect(await screen.findByText("Lutas")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2 / 1")).toBeInTheDocument();
    expect(screen.getByText("66.7%")).toBeInTheDocument();
  });

  it("mostra a linha do tempo de competições", async () => {
    renderPage([athleteMock, statsMock, weighInsMock]);

    expect(
      await screen.findByText(/Copa São Paulo de Judô/),
    ).toBeInTheDocument();
  });
});
