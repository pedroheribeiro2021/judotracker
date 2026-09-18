import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import PromotionForm from "./PromotionForm";
import {
  RECORD_PROMOTION,
  GET_PROMOTIONS,
  GET_ATHLETE,
} from "../graphql/queries";

function renderForm(mocks: MockedResponse[], props: Record<string, any> = {}) {
  const onSuccess = props.onSuccess ?? (() => {});
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PromotionForm athleteId="athlete-1" onSuccess={onSuccess} {...props} />
    </MockedProvider>,
  );
}

describe("PromotionForm", () => {
  it("mostra erro de validação e não envia a mutation sem data", async () => {
    renderForm([]);

    await userEvent.click(
      screen.getByRole("button", { name: "Registrar graduação" }),
    );

    expect(await screen.findByText(/informe a data/i)).toBeInTheDocument();
  });

  it("registra a graduação com o payload esperado", async () => {
    let called = false;
    const recordMock: MockedResponse = {
      request: {
        query: RECORD_PROMOTION,
        variables: {
          input: {
            athleteId: "athlete-1",
            rank: "WHITE",
            promotedAt: "2026-01-10",
            promotedBy: "Sensei João",
            notes: null,
          },
        },
      },
      result: () => {
        called = true;
        return {
          data: {
            recordPromotion: {
              id: "promo-1",
              athleteId: "athlete-1",
              rank: "WHITE",
              promotedAt: "2026-01-10",
              promotedBy: "Sensei João",
              notes: null,
            },
          },
        };
      },
    };
    const refetchPromotionsMock: MockedResponse = {
      request: { query: GET_PROMOTIONS, variables: { athleteId: "athlete-1" } },
      result: { data: { promotions: [] } },
    };
    const refetchAthleteMock: MockedResponse = {
      request: { query: GET_ATHLETE, variables: { id: "athlete-1" } },
      result: { data: { athlete: null } },
    };

    let successCalled = false;
    renderForm([recordMock, refetchPromotionsMock, refetchAthleteMock], {
      onSuccess: () => (successCalled = true),
    });

    await userEvent.type(
      screen.getByLabelText("Data da graduação"),
      "2026-01-10",
    );
    await userEvent.type(
      screen.getByLabelText("Outorgada por (opcional)"),
      "Sensei João",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Registrar graduação" }),
    );

    await waitFor(() => expect(called).toBe(true));
    await waitFor(() => expect(successCalled).toBe(true));
  });
});
