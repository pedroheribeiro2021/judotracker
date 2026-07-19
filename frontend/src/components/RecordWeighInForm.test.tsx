import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { RecordWeighInForm } from "./RecordWeighInForm";
import { GET_ATHLETES, RECORD_WEIGHIN } from "../graphql/queries";

const getAthletesMock: MockedResponse = {
  request: { query: GET_ATHLETES },
  result: {
    data: {
      athletes: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          user: { id: "u1", email: "atleta@mail.com", name: "Atleta Um" },
          dob: null,
          heightCm: null,
          defaultWeightKg: 73,
          coach: null,
        },
      ],
    },
  },
};

function renderForm(mocks: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <RecordWeighInForm />
    </MockedProvider>,
  );
}

describe("RecordWeighInForm", () => {
  it("mostra erro de validação quando nenhum atleta é selecionado e o peso não é informado", async () => {
    renderForm([getAthletesMock]);

    await screen.findByText("Atleta Um (73 kg)");
    await userEvent.click(screen.getByRole("button", { name: "Registrar Pesagem" }));

    expect(
      await screen.findByText("Selecione um atleta válido"),
    ).toBeInTheDocument();
  });

  it("envia a mutation com o payload esperado ao preencher atleta e peso", async () => {
    const recordWeighInMock: MockedResponse = {
      request: {
        query: RECORD_WEIGHIN,
        variables: {
          input: {
            athleteId: "11111111-1111-4111-8111-111111111111",
            weightKg: 72.4,
            recordedAt: null,
            notes: "",
          },
        },
      },
      result: {
        data: {
          recordWeighIn: {
            id: "wi-1",
            athleteId: "11111111-1111-4111-8111-111111111111",
            weightKg: 72.4,
            recordedAt: "2026-01-01T00:00:00.000Z",
          },
        },
      },
    };

    renderForm([getAthletesMock, recordWeighInMock]);

    await screen.findByText("Atleta Um (73 kg)");
    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "11111111-1111-4111-8111-111111111111",
    );
    const weightInput = screen.getByPlaceholderText("Ex.: 72.4");
    await userEvent.clear(weightInput);
    await userEvent.type(weightInput, "72.4");
    await userEvent.click(screen.getByRole("button", { name: "Registrar Pesagem" }));

    // Se o payload enviado não bater com o mock, o MockedProvider não resolve
    // e o form nunca reseta — o waitFor abaixo expõe isso.
    await waitFor(() => expect(weightInput).toHaveValue(null));
  });
});
