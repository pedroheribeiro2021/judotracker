import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import InjuryForm from "./InjuryForm";
import { RECORD_INJURY, GET_INJURIES, GET_ATHLETE } from "../graphql/queries";

function renderForm(mocks: MockedResponse[], props: Record<string, any> = {}) {
  const onSuccess = props.onSuccess ?? (() => {});
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <InjuryForm athleteId="athlete-1" onSuccess={onSuccess} {...props} />
    </MockedProvider>,
  );
}

describe("InjuryForm", () => {
  it("mostra erro de validação e não envia a mutation com região muito curta", async () => {
    renderForm([]);

    await userEvent.type(screen.getByLabelText("Região afetada"), "J");
    await userEvent.click(
      screen.getByRole("button", { name: "Registrar lesão" }),
    );

    expect(
      await screen.findByText(/informe a região afetada/i),
    ).toBeInTheDocument();
  });

  it("registra a lesão com o payload esperado", async () => {
    let called = false;
    const recordMock: MockedResponse = {
      request: {
        query: RECORD_INJURY,
        variables: {
          input: {
            athleteId: "athlete-1",
            bodyPart: "Joelho direito",
            description: "Entorse no randori",
            occurredAt: "2026-01-10",
            expectedReturn: null,
            severity: "MINOR",
            notes: null,
          },
        },
      },
      result: () => {
        called = true;
        return {
          data: {
            recordInjury: {
              id: "injury-1",
              athleteId: "athlete-1",
              bodyPart: "Joelho direito",
              description: "Entorse no randori",
              occurredAt: "2026-01-10",
              expectedReturn: null,
              resolvedAt: null,
              severity: "MINOR",
              notes: null,
            },
          },
        };
      },
    };
    const refetchInjuriesMock: MockedResponse = {
      request: { query: GET_INJURIES, variables: { athleteId: "athlete-1" } },
      result: { data: { injuries: [] } },
    };
    const refetchAthleteMock: MockedResponse = {
      request: { query: GET_ATHLETE, variables: { id: "athlete-1" } },
      result: { data: { athlete: null } },
    };

    let successCalled = false;
    renderForm([recordMock, refetchInjuriesMock, refetchAthleteMock], {
      onSuccess: () => (successCalled = true),
    });

    await userEvent.type(
      screen.getByLabelText("Região afetada"),
      "Joelho direito",
    );
    await userEvent.type(
      screen.getByLabelText("Descrição"),
      "Entorse no randori",
    );
    await userEvent.type(
      screen.getByLabelText("Data da lesão"),
      "2026-01-10",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Registrar lesão" }),
    );

    await waitFor(() => expect(called).toBe(true));
    await waitFor(() => expect(successCalled).toBe(true));
  });
});
