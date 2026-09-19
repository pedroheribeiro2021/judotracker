import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import TrainingSessionForm from "./TrainingSessionForm";
import { CREATE_TRAINING_SESSION } from "../graphql/queries";

function renderForm(mocks: MockedResponse[], props: Record<string, any> = {}) {
  const onSuccess = props.onSuccess ?? (() => {});
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <TrainingSessionForm onSuccess={onSuccess} {...props} />
    </MockedProvider>,
  );
}

describe("TrainingSessionForm", () => {
  it("mostra erro de validação e não envia a mutation sem data", async () => {
    renderForm([]);

    await userEvent.click(
      screen.getByRole("button", { name: "Criar sessão" }),
    );

    expect(await screen.findByText(/informe a data e hora/i)).toBeInTheDocument();
  });

  it("cria a sessão com o payload esperado", async () => {
    let called = false;
    const createMock: MockedResponse = {
      request: {
        query: CREATE_TRAINING_SESSION,
        variables: {
          input: {
            date: new Date("2026-01-14T18:00").toISOString(),
            type: "TECHNICAL",
            durationMinutes: 90,
            notes: null,
          },
        },
      },
      result: () => {
        called = true;
        return {
          data: {
            createTrainingSession: {
              id: "session-1",
              date: new Date("2026-01-14T18:00").toISOString(),
              type: "TECHNICAL",
              durationMinutes: 90,
              notes: null,
            },
          },
        };
      },
    };

    let successCalled = false;
    renderForm([createMock], { onSuccess: () => (successCalled = true) });

    const dateInput = screen.getByLabelText("Data e hora");
    fireEvent.change(dateInput, { target: { value: "2026-01-14T18:00" } });
    await userEvent.click(
      screen.getByRole("button", { name: "Criar sessão" }),
    );

    await waitFor(() => expect(called).toBe(true));
    await waitFor(() => expect(successCalled).toBe(true));
  });
});
