// frontend/src/components/EntrySummaryModal.tsx
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { Modal } from "../ui/components/Modal";
import { Button } from "../ui";
import { ConfirmDialog } from "./ConfirmDialog";
import { MatchForm } from "./MatchForm";
import {
  DELETE_MATCH,
  GET_MATCHES,
  SET_ENTRY_RESULT,
} from "../graphql/queries";
import {
  MATCH_RESULT_LABELS,
  SCORE_TYPE_LABELS,
  MEDALS,
  MEDAL_LABELS,
  Medal,
} from "../domain/matchEnums";

type Props = {
  entry: { id: string; finalPosition?: number | null; medal?: Medal | null };
  athleteName: string;
  competitionName: string;
  open: boolean;
  onClose: () => void;
  onResultSaved?: () => void;
};

export const EntrySummaryModal: React.FC<Props> = ({
  entry,
  athleteName,
  competitionName,
  open,
  onClose,
  onResultSaved,
}) => {
  const { data, loading, error, refetch } = useQuery(GET_MATCHES, {
    variables: { entryId: entry.id },
    skip: !open,
    fetchPolicy: "network-only",
  });

  const [deleteMatch] = useMutation(DELETE_MATCH);
  const [setEntryResult, { loading: savingResult }] =
    useMutation(SET_ENTRY_RESULT);

  const [openForm, setOpenForm] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState<any>(null);
  const [matchToDelete, setMatchToDelete] = useState<any>(null);

  const [finalPosition, setFinalPosition] = useState(
    entry.finalPosition != null ? String(entry.finalPosition) : "",
  );
  const [medal, setMedal] = useState<Medal | "">(entry.medal ?? "");

  const matches = data?.matches ?? [];

  const handleDelete = async () => {
    if (!matchToDelete) return;
    try {
      await deleteMatch({ variables: { id: matchToDelete.id } });
      toast.success("Luta removida");
      setMatchToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao remover luta");
    }
  };

  const handleSaveResult = async () => {
    try {
      await setEntryResult({
        variables: {
          entryId: entry.id,
          finalPosition: finalPosition === "" ? null : Number(finalPosition),
          medal: medal === "" ? null : medal,
        },
      });
      toast.success("Resultado final salvo");
      onResultSaved?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar resultado");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Súmula: ${athleteName} — ${competitionName}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Resultado final</h3>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="text-sm block mb-1 text-text-muted">
                Colocação
              </span>
              <input
                type="number"
                min={1}
                value={finalPosition}
                onChange={(e) => setFinalPosition(e.target.value)}
                className="w-28 p-2 border rounded-lg bg-white"
              />
            </label>
            <label className="block">
              <span className="text-sm block mb-1 text-text-muted">
                Medalha
              </span>
              <select
                value={medal}
                onChange={(e) => setMedal(e.target.value as Medal | "")}
                className="w-44 p-2 border rounded-lg bg-white"
              >
                <option value="">-</option>
                {MEDALS.map((m) => (
                  <option key={m} value={m}>
                    {MEDAL_LABELS[m]}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveResult}
              disabled={savingResult}
            >
              {savingResult ? "Salvando..." : "Salvar resultado"}
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Lutas</h3>
            <Button size="sm" onClick={() => setOpenForm(true)}>
              + Registrar luta
            </Button>
          </div>

          {loading && (
            <div className="text-sm text-text-muted">Carregando lutas...</div>
          )}
          {error && (
            <div className="text-sm text-danger-500">
              Erro ao carregar lutas
            </div>
          )}
          {!loading && matches.length === 0 && (
            <div className="text-sm text-text-muted">
              Nenhuma luta registrada.
            </div>
          )}

          {matches.length > 0 && (
            <ul className="divide-y border rounded-lg">
              {matches.map((m: any) => (
                <li key={m.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {m.round} ·{" "}
                        {
                          MATCH_RESULT_LABELS[
                            m.result as keyof typeof MATCH_RESULT_LABELS
                          ]
                        }
                        {m.goldenScore ? " · Golden score" : ""}
                      </div>
                      <div className="text-sm text-text-muted">
                        vs. {m.opponentName}
                        {m.opponentClub ? ` (${m.opponentClub})` : ""}
                        {m.scoreType ? ` · ${SCORE_TYPE_LABELS[m.scoreType as keyof typeof SCORE_TYPE_LABELS]}` : ""}
                        {m.technique ? ` · ${m.technique}` : ""}
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        Shidos: {m.shidosFor} x {m.shidosAgainst}
                        {m.durationSeconds
                          ? ` · ${m.durationSeconds}s`
                          : ""}
                      </div>
                      {m.notes && (
                        <div className="text-xs text-text-muted mt-1">
                          {m.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        className="text-xs text-[var(--brand-600)] hover:underline"
                        onClick={() => setMatchToEdit(m)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-xs text-danger-500 hover:text-red-700"
                        onClick={() => setMatchToDelete(m)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title="Registrar luta"
      >
        <MatchForm
          entryId={entry.id}
          onSuccess={() => {
            setOpenForm(false);
            refetch();
          }}
          onCancel={() => setOpenForm(false)}
        />
      </Modal>

      <Modal
        open={Boolean(matchToEdit)}
        onClose={() => setMatchToEdit(null)}
        title="Editar luta"
      >
        {matchToEdit && (
          <MatchForm
            entryId={entry.id}
            match={matchToEdit}
            onSuccess={() => {
              setMatchToEdit(null);
              refetch();
            }}
            onCancel={() => setMatchToEdit(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(matchToDelete)}
        onClose={() => setMatchToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir luta"
        message="Tem certeza que deseja excluir esta luta da súmula?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </Modal>
  );
};

export default EntrySummaryModal;
