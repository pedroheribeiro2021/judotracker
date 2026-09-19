// frontend/src/components/AttendanceRollCall.tsx
//
// Tela de chamada otimizada para uso rápido no tatame: botões grandes,
// um toque por atleta, sem formulários ou campos de texto no caminho.
import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { GET_ATHLETES, SET_ATTENDANCE } from "../graphql/queries";
import { Button } from "../ui";

type Props = {
  session: { id: string; attendances: { athleteId: string; present: boolean }[] };
  onSuccess: () => void;
  onCancel?: () => void;
};

export const AttendanceRollCall: React.FC<Props> = ({
  session,
  onSuccess,
  onCancel,
}) => {
  const { data, loading } = useQuery(GET_ATHLETES, { fetchPolicy: "cache-first" });
  const [setAttendance, { loading: saving }] = useMutation(SET_ATTENDANCE);

  const initialPresent = useMemo(
    () =>
      new Set(
        session.attendances.filter((a) => a.present).map((a) => a.athleteId),
      ),
    [session.attendances],
  );
  const [present, setPresent] = useState<Set<string>>(initialPresent);

  const athletes = data?.athletes ?? [];

  const toggle = (athleteId: string) => {
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(athleteId)) next.delete(athleteId);
      else next.add(athleteId);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await setAttendance({
        variables: { sessionId: session.id, athleteIds: Array.from(present) },
      });
      toast.success("Chamada salva");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar chamada");
    }
  };

  if (loading) return <div className="text-sm text-text-muted">Carregando atletas...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-text-muted">
        {present.size} de {athletes.length} presentes — toque para marcar/desmarcar
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-auto">
        {athletes.map((a: any) => {
          const isPresent = present.has(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              className={`p-4 rounded-xl text-left font-medium text-sm transition-colors border-2 ${
                isPresent
                  ? "bg-success-500 border-success-500 text-white"
                  : "bg-white border-gray-200 text-text-default"
              }`}
            >
              {a.user?.name ?? a.user?.email}
            </button>
          );
        })}
      </div>

      {athletes.length === 0 && (
        <div className="text-sm text-text-muted">Nenhum atleta cadastrado.</div>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar chamada"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AttendanceRollCall;
