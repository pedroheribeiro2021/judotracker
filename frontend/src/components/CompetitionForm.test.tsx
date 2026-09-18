import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import CompetitionForm from "./CompetitionForm";
import { CREATE_COMPETITION, UPDATE_COMPETITION } from "../graphql/queries";

function renderForm(mocks: MockedResponse[], props: Record<string, any> = {}) {
  const onSuccess = props.onSuccess ?? (() => {});
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <CompetitionForm onSuccess={onSuccess} {...props} />
    </MockedProvider>,
  );
}

describe("CompetitionForm", () => {
  it("mostra erro de validação e não envia a mutation quando o nome é muito curto", async () => {
    renderForm([]);

    await userEvent.type(screen.getByLabelText("Nome"), "A");
    await userEvent.click(
      screen.getByRole("button", { name: "Criar Competição" }),
    );

    expect(
      await screen.findByText(/ao menos 2 caracteres/i),
    ).toBeInTheDocument();
  });

  it("cria uma competição com o payload esperado", async () => {
    let called = false;
    const createMock: MockedResponse = {
      request: {
        query: CREATE_COMPETITION,
        variables: {
          input: {
            name: "Copa São Paulo",
            date: "2026-09-15",
            location: null,
            level: "ESTADUAL",
            federation: null,
            city: null,
            state: null,
            registrationDeadline: null,
            notes: null,
          },
        },
      },
      result: () => {
        called = true;
        return {
          data: {
            createCompetition: {
              id: "comp-1",
              name: "Copa São Paulo",
              date: "2026-09-15",
              location: null,
              level: "ESTADUAL",
              federation: null,
              city: null,
              state: null,
              registrationDeadline: null,
              notes: null,
            },
          },
        };
      },
    };

    let successCalled = false;
    renderForm([createMock], { onSuccess: () => (successCalled = true) });

    await userEvent.type(screen.getByLabelText("Nome"), "Copa São Paulo");
    await userEvent.type(screen.getByLabelText("Data"), "2026-09-15");
    await userEvent.selectOptions(screen.getByText("Regional").closest("select")!, "ESTADUAL");
    await userEvent.click(
      screen.getByRole("button", { name: "Criar Competição" }),
    );

    await waitFor(() => expect(called).toBe(true));
    await waitFor(() => expect(successCalled).toBe(true));
  });

  it("no modo edição, pré-preenche o formulário e envia updateCompetition", async () => {
    const competition = {
      id: "comp-1",
      name: "Copa Antiga",
      date: "2026-05-01T00:00:00.000Z",
      location: "Ginásio X",
      level: "NACIONAL",
      federation: "CBJ",
      city: "São Paulo",
      state: "SP",
      registrationDeadline: null,
      notes: null,
    };

    let called = false;
    const updateMock: MockedResponse = {
      request: {
        query: UPDATE_COMPETITION,
        variables: {
          input: {
            id: "comp-1",
            name: "Copa Atualizada",
            date: "2026-05-01",
            location: "Ginásio X",
            level: "NACIONAL",
            federation: "CBJ",
            city: "São Paulo",
            state: "SP",
            registrationDeadline: null,
            notes: null,
          },
        },
      },
      result: () => {
        called = true;
        return { data: { updateCompetition: { ...competition, name: "Copa Atualizada" } } };
      },
    };

    renderForm([updateMock], { competition });

    expect(screen.getByLabelText("Nome")).toHaveValue("Copa Antiga");

    await userEvent.clear(screen.getByLabelText("Nome"));
    await userEvent.type(screen.getByLabelText("Nome"), "Copa Atualizada");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(called).toBe(true));
  });
});
