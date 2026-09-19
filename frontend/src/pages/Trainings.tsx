// frontend/src/pages/Trainings.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
} from "date-fns";
import toast from "react-hot-toast";
import {
  GET_TRAINING_SESSIONS,
  DELETE_TRAINING_SESSION,
} from "../graphql/queries";
import { Button, Card, Badge } from "../ui";
import { Modal } from "../ui/components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TrainingSessionForm } from "../components/TrainingSessionForm";
import { AttendanceRollCall } from "../components/AttendanceRollCall";
import { TRAINING_TYPE_LABELS, TrainingType } from "../domain/trainingTypes";

export const Trainings: React.FC = () => {
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const weekStart = startOfWeek(weekAnchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekAnchor, { weekStartsOn: 1 });

  const { data, loading, error, refetch } = useQuery(GET_TRAINING_SESSIONS, {
    variables: { from: weekStart.toISOString(), to: weekEnd.toISOString() },
    fetchPolicy: "network-only",
  });

  const [deleteTrainingSession] = useMutation(DELETE_TRAINING_SESSION);

  const [openCreate, setOpenCreate] = useState(false);
  const [rollCallSession, setRollCallSession] = useState<any>(null);
  const [sessionToDelete, setSessionToDelete] = useState<any>(null);

  const sessions = data?.trainingSessions ?? [];

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await deleteTrainingSession({ variables: { id: sessionToDelete.id } });
      toast.success("Sessão excluída");
      setSessionToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao excluir sessão");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      <header className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link
              to="/"
              className="text-sm text-[var(--brand-600)] hover:underline"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Treinos</h1>
          </div>
          <Button onClick={() => setOpenCreate(true)}>+ Sessão</Button>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setWeekAnchor((d) => subWeeks(d, 1))}
          >
            ← Semana anterior
          </Button>
          <div className="text-sm font-medium">
            {format(weekStart, "dd/MM")} – {format(weekEnd, "dd/MM/yyyy")}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setWeekAnchor((d) => addWeeks(d, 1))}
          >
            Semana seguinte →
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        {loading && (
          <div className="text-center py-8 text-text-muted text-sm">
            Carregando sessões...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
            Erro ao carregar sessões
          </div>
        )}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            Nenhuma sessão de treino nesta semana.
          </div>
        )}

        <div className="space-y-3">
          {[...sessions]
            .sort(
              (a: any, b: any) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .map((session: any) => {
              const presentCount = session.attendances.filter(
                (a: any) => a.present,
              ).length;
              return (
                <Card key={session.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {format(new Date(session.date), "EEEE, dd/MM/yyyy HH:mm")}
                        </span>
                        <Badge>
                          {TRAINING_TYPE_LABELS[session.type as TrainingType] ??
                            session.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        {session.durationMinutes} min
                        {presentCount > 0 ? ` · ${presentCount} presentes` : ""}
                        {session.notes ? ` · ${session.notes}` : ""}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setRollCallSession(session)}>
                        Fazer chamada
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setSessionToDelete(session)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      </main>

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Nova sessão de treino"
      >
        <TrainingSessionForm
          onSuccess={() => {
            setOpenCreate(false);
            refetch();
          }}
          onCancel={() => setOpenCreate(false)}
        />
      </Modal>

      <Modal
        open={Boolean(rollCallSession)}
        onClose={() => setRollCallSession(null)}
        title={
          rollCallSession
            ? `Chamada: ${format(new Date(rollCallSession.date), "dd/MM/yyyy HH:mm")}`
            : "Chamada"
        }
        size="lg"
      >
        {rollCallSession && (
          <AttendanceRollCall
            session={rollCallSession}
            onSuccess={() => {
              setRollCallSession(null);
              refetch();
            }}
            onCancel={() => setRollCallSession(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir sessão de treino"
        message="Tem certeza que deseja excluir esta sessão? As presenças registradas também serão removidas."
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Trainings;
