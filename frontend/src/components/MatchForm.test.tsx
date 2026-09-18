import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import MatchForm from "./MatchForm";
import { RECORD_MATCH, UPDATE_MATCH, GET_MATCHES } from "../graphql/queries";

function renderForm(mocks: MockedResponse[], props: Record<string, any> = {}) {
  const onSuccess = props.onSuccess ?? (() => {});
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MatchForm entryId="entry-1" onSuccess={onSuccess} {...props} />
    </MockedProvider>,
  );
}

describe("MatchForm", () => {
  it("mostra erro de validação e não envia a mutation quando o adversário é muito curto", async () => {
    renderForm([]);

    await userEvent.type(screen.getByLabelText("Adversário"), "A");
    await userEvent.click(
      screen.getByRole("button", { name: "Registrar luta" }),
    );

    expect(
      await screen.findByText(/nome do advers/i),
    ).toBeInTheDocument();
  });

  it("registra uma luta com os defaults esperados", async () => {
    let called = false;
    const recordMock: MockedResponse = {
      request: {
        query: RECORD_MATCH,
        variables: {
          input: {
            entryId: "entry-1",
            round: "eliminatória",
            opponentName: "Carlos Mendes",
            opponentClub: null,
            result: "WIN",
            scoreType: null,
            technique: null,
            shidosFor: 0,
            shidosAgainst: 0,
            goldenScore: false,
            durationSeconds: null,
            notes: null,
          },
        },
      },
      result: () => {
        called = true;
        return {
          data: {
            recordMatch: {
              id: "match-1",
              entryId: "entry-1",
              round: "eliminatória",
              opponentName: "Carlos Mendes",
              opponentClub: null,
              result: "WIN",
              scoreType: null,
              technique: null,
              shidosFor: 0,
              shidosAgainst: 0,
              goldenScore: false,
              durationSeconds: null,
              notes: null,
            },
          },
        };
      },
    };
    const refetchMock: MockedResponse = {
      request: { query: GET_MATCHES, variables: { entryId: "entry-1" } },
      result: { data: { matches: [] } },
    };

    let successCalled = false;
    renderForm([recordMock, refetchMock], {
      onSuccess: () => (successCalled = true),
    });

    await userEvent.type(
      screen.getByLabelText("Adversário"),
      "Carlos Mendes",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Registrar luta" }),
    );

    await waitFor(() => expect(called).toBe(true));
    await waitFor(() => expect(successCalled).toBe(true));
  });

  it("no modo edição, pré-preenche o formulário e envia updateMatch", async () => {
    const match = {
      id: "match-1",
      entryId: "entry-1",
      round: "final",
      opponentName: "Bruno Costa",
      opponentClub: null,
      result: "LOSS",
      scoreType: null,
      technique: null,
      shidosFor: 1,
      shidosAgainst: 0,
      goldenScore: false,
      durationSeconds: null,
      notes: null,
    };

    let called = false;
    const updateMock: MockedResponse = {
      request: {
        query: UPDATE_MATCH,
        variables: {
          input: {
            id: "match-1",
            round: "final",
            opponentName: "Bruno C. Silva",
            opponentClub: null,
            result: "LOSS",
            scoreType: null,
            technique: null,
            shidosFor: 1,
            shidosAgainst: 0,
            goldenScore: false,
            durationSeconds: null,
            notes: null,
          },
        },
      },
      result: () => {
        called = true;
        return {
          data: { updateMatch: { ...match, opponentName: "Bruno C. Silva" } },
        };
      },
    };
    const refetchMock: MockedResponse = {
      request: { query: GET_MATCHES, variables: { entryId: "entry-1" } },
      result: { data: { matches: [] } },
    };

    renderForm([updateMock, refetchMock], { match });

    expect(screen.getByLabelText("Adversário")).toHaveValue("Bruno Costa");

    await userEvent.clear(screen.getByLabelText("Adversário"));
    await userEvent.type(screen.getByLabelText("Adversário"), "Bruno C. Silva");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(called).toBe(true));
  });
});
