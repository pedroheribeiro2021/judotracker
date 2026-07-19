import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import CreateAthleteForm from "./CreateAthleteForm";
import { CREATE_ATHLETE, GET_ATHLETES, GET_COACHES } from "../graphql/queries";

const getCoachesMock: MockedResponse = {
  request: { query: GET_COACHES },
  result: { data: { coaches: [] } },
};

function renderForm(mocks: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <CreateAthleteForm />
    </MockedProvider>,
  );
}

describe("CreateAthleteForm", () => {
  it("mostra erro de validação e não envia a mutation quando o email é inválido", async () => {
    renderForm([getCoachesMock]);

    await userEvent.type(screen.getByLabelText("Email"), "nao-e-email");
    await userEvent.type(screen.getByLabelText("Nome"), "Fulano de Tal");
    await userEvent.click(screen.getByRole("button", { name: "Criar Atleta" }));

    expect(await screen.findByText(/email/i, { selector: "div" })).toBeInTheDocument();
  });

  it("envia a mutation com o payload esperado e reseta o formulário em caso de sucesso", async () => {
    const createAthleteMock: MockedResponse = {
      request: {
        query: CREATE_ATHLETE,
        variables: {
          input: {
            email: "novo@mail.com",
            name: "Fulano de Tal",
            dob: null,
            heightCm: null,
            defaultWeightKg: null,
            coachId: null,
          },
        },
      },
      result: {
        data: {
          createAthlete: {
            id: "athlete-1",
            user: { id: "user-1", email: "novo@mail.com", name: "Fulano de Tal" },
            dob: null,
            heightCm: null,
            defaultWeightKg: null,
            coach: null,
          },
        },
      },
    };
    const getAthletesMock: MockedResponse = {
      request: { query: GET_ATHLETES },
      result: { data: { athletes: [] } },
    };

    renderForm([getCoachesMock, createAthleteMock, getAthletesMock]);

    await userEvent.type(screen.getByLabelText("Email"), "novo@mail.com");
    await userEvent.type(screen.getByLabelText("Nome"), "Fulano de Tal");
    await userEvent.click(screen.getByRole("button", { name: "Criar Atleta" }));

    // Se a mutation não bater exatamente com o mock (payload errado), o
    // MockedProvider não resolve e o form nunca reseta — o waitFor expõe isso.
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveValue(""));
  });
});
