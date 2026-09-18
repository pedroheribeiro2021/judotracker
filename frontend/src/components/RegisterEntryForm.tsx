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
  const [submitting, setSubmitting] = useState(false);
  const [registerEntry] = useMutation(REGISTER_ENTRY);

  const athletes = (data?.athletes ?? []).filter(
    (a: any) => !registeredAthleteIds.includes(a.id),
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
          registerEntry({ variables: { competitionId, athleteId } }),
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
          {athletes.map((a: any) => (
            <label
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-surface-100"
            >
              <input
                type="checkbox"
                checked={selected.has(a.id)}
                onChange={() => toggle(a.id)}
              />
              <span className="text-sm">
                {a.user?.name ?? a.user?.email}{" "}
                {a.defaultWeightKg ? `(${a.defaultWeightKg} kg)` : ""}
              </span>
            </label>
          ))}
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
