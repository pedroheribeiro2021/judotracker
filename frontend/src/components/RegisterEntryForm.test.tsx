import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import RegisterEntryForm from "./RegisterEntryForm";
import { GET_ATHLETES, REGISTER_ENTRY } from "../graphql/queries";

const athletesMock: MockedResponse = {
  request: { query: GET_ATHLETES },
  result: {
    data: {
      athletes: [
        {
          id: "athlete-1",
          user: { id: "u1", email: "joao@mail.com", name: "João" },
          dob: null,
          sex: null,
          heightCm: null,
          defaultWeightKg: 73,
          ageDivision: null,
          currentWeightClass: "-73",
          lastWeighInKg: 73,
          currentBelt: null,
          status: "INJURED",
          attendanceStats: { rate30: 0, rate90: 0, currentStreak: 0, sessions30: 0, sessions90: 0 },
          coach: null,
          entries: [],
        },
      ],
    },
  },
};

function renderForm(mocks: MockedResponse[], props: Record<string, any> = {}) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <RegisterEntryForm
        competitionId="comp-1"
        registeredAthleteIds={[]}
        onSuccess={props.onSuccess ?? (() => {})}
        onCancel={() => {}}
      />
    </MockedProvider>,
  );
}

describe("RegisterEntryForm — bloqueio suave para atleta lesionado", () => {
  it("mostra badge de lesionado e pede confirmação antes de inscrever", async () => {
    let called = false;
    const registerMock: MockedResponse = {
      request: {
        query: REGISTER_ENTRY,
        variables: { competitionId: "comp-1", athleteId: "athlete-1", weightClass: "-73" },
      },
      result: () => {
        called = true;
        return {
          data: {
            registerEntry: {
              id: "entry-1",
              athleteId: "athlete-1",
              weightClass: "-73",
              athlete: { id: "athlete-1", user: { id: "u1", name: "João", email: "joao@mail.com" } },
            },
          },
        };
      },
    };

    let successCalled = false;
    renderForm([athletesMock, registerMock], {
      onSuccess: () => (successCalled = true),
    });

    expect(await screen.findByText("Lesionado")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: /inscrever \(1\)/i }));

    expect(
      await screen.findByText(/está\(ão\) com lesão ativa/i),
    ).toBeInTheDocument();
    expect(called).toBe(false);

    await userEvent.click(
      screen.getByRole("button", { name: "Inscrever mesmo assim" }),
    );

    await waitFor(() => expect(called).toBe(true));
    await waitFor(() => expect(successCalled).toBe(true));
  });
});
