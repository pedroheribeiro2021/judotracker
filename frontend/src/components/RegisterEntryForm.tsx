// frontend/src/components/RegisterEntryForm.tsx
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { GET_ATHLETES, REGISTER_ENTRY } from "../graphql/queries";
import { Button } from "../ui";

type Props = {
  competitionId: string;
  registeredAthleteIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
};

export const RegisterEntryForm: React.FC<Props> = ({
  competitionId,
  registeredAthleteIds,
  onSuccess,
  onCancel,
}) => {
  const { data, loading, error } = useQuery(GET_ATHLETES);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [weightClassByAthlete, setWeightClassByAthlete] = useState<
    Record<string, string>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [registerEntry] = useMutation(REGISTER_ENTRY);

  const athletes = (data?.athletes ?? []).filter(
    (a: any) => !registeredAthleteIds.includes(a.id),
  );

  const toggle = (athlete: any) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(athlete.id)) next.delete(athlete.id);
      else next.add(athlete.id);
      return next;
    });
    // Sugere automaticamente a categoria de peso oficial do atleta (CBJ),
    // calculada no backend a partir da pesagem mais recente; o treinador
    // pode sobrescrever livremente antes de confirmar a inscrição.
    setWeightClassByAthlete((prev) =>
      prev[athlete.id] != null
        ? prev
        : { ...prev, [athlete.id]: athlete.currentWeightClass ?? "" },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.size === 0) {
      toast.error("Selecione ao menos um atleta");
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all(
        Array.from(selected).map((athleteId) =>
          registerEntry({
            variables: {
              competitionId,
              athleteId,
              weightClass: weightClassByAthlete[athleteId] || undefined,
            },
          }),
        ),
      );
      toast.success("Atletas inscritos com sucesso");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Erro ao inscrever atletas");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loading && <div>Carregando atletas...</div>}
      {error && <div className="text-danger-500">Erro ao carregar atletas</div>}

      {!loading && athletes.length === 0 && (
        <div className="text-sm text-text-muted">
          Todos os atletas já estão inscritos nesta competição.
        </div>
      )}

      {athletes.length > 0 && (
        <div className="max-h-72 overflow-auto border rounded-lg divide-y">
          {athletes.map((a: any) => {
            const isSelected = selected.has(a.id);
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-surface-100"
              >
                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(a)}
                  />
                  <span className="text-sm">
                    {a.user?.name ?? a.user?.email}{" "}
                    {a.defaultWeightKg ? `(${a.defaultWeightKg} kg)` : ""}
                  </span>
                </label>
                {isSelected && (
                  <input
                    type="text"
                    value={weightClassByAthlete[a.id] ?? ""}
                    onChange={(e) =>
                      setWeightClassByAthlete((prev) => ({
                        ...prev,
                        [a.id]: e.target.value,
                      }))
                    }
                    placeholder="Categoria"
                    title="Categoria de peso (sugerida automaticamente, editável)"
                    className="w-24 text-sm p-1 border rounded"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting || selected.size === 0}>
          {submitting ? "Inscrevendo..." : `Inscrever (${selected.size})`}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default RegisterEntryForm;
