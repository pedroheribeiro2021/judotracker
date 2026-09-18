// frontend/src/pages/Competitions.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { differenceInCalendarDays, format } from "date-fns";
import toast from "react-hot-toast";
import {
  DELETE_COMPETITION,
  GET_COMPETITIONS,
  REMOVE_ENTRY,
} from "../graphql/queries";
import { Badge, Button, Card } from "../ui";
import { Modal } from "../ui/components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CompetitionForm } from "../components/CompetitionForm";
import { RegisterEntryForm } from "../components/RegisterEntryForm";
import { EntrySummaryModal } from "../components/EntrySummaryModal";
import {
  COMPETITION_LEVEL_LABELS,
  CompetitionLevel,
} from "../domain/competitionLevels";
import { MEDAL_EMOJI, Medal } from "../domain/matchEnums";

type Tab = "upcoming" | "past";

function safeFormat(value?: string | null, pattern = "dd/MM/yyyy") {
  if (!value) return "-";
  try {
    return format(new Date(value), pattern);
  } catch {
    return "-";
  }
}

const CompetitionCard: React.FC<{
  competition: any;
  tab: Tab;
  onEdit: () => void;
  onDelete: () => void;
  onRegister: () => void;
  onRemoveEntry: (entryId: string) => void;
  onOpenSummary: (entry: any) => void;
}> = ({
  competition,
  tab,
  onEdit,
  onDelete,
  onRegister,
  onRemoveEntry,
  onOpenSummary,
}) => {
  const deadlineDays =
    tab === "upcoming" && competition.registrationDeadline
      ? differenceInCalendarDays(
          new Date(competition.registrationDeadline),
          new Date(),
        )
      : null;
  const deadlineSoon =
    deadlineDays != null && deadlineDays >= 0 && deadlineDays <= 7;

  return (
    <Card className="mb-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg">{competition.name}</h3>
            {competition.level && (
              <Badge>
                {COMPETITION_LEVEL_LABELS[
                  competition.level as CompetitionLevel
                ] ?? competition.level}
              </Badge>
            )}
          </div>
          <div className="text-sm text-text-muted mt-1">
            {safeFormat(competition.date)}
            {competition.city || competition.state
              ? ` · ${[competition.city, competition.state].filter(Boolean).join("/")}`
              : ""}
            {competition.location ? ` · ${competition.location}` : ""}
            {competition.federation ? ` · ${competition.federation}` : ""}
          </div>
          {deadlineSoon && (
            <div className="mt-2">
              <Badge variant="danger">
                Inscrições encerram em {deadlineDays}{" "}
                {deadlineDays === 1 ? "dia" : "dias"} (
                {safeFormat(competition.registrationDeadline)})
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {tab === "upcoming" && (
            <Button size="sm" onClick={onRegister}>
              Inscrever atletas
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={onEdit}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={onDelete}>
            Excluir
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm font-medium text-text-muted mb-1">
          Inscritos ({competition.entries?.length ?? 0})
        </div>
        {(!competition.entries || competition.entries.length === 0) && (
          <div className="text-sm text-text-muted">
            Nenhum atleta inscrito.
          </div>
        )}
        {competition.entries?.length > 0 && (
          <ul className="divide-y">
            {competition.entries.map((entry: any) => (
              <li
                key={entry.id}
                className={`flex items-center justify-between py-1.5 text-sm ${
                  tab === "past" ? "cursor-pointer hover:bg-surface-100" : ""
                }`}
                onClick={
                  tab === "past" ? () => onOpenSummary(entry) : undefined
                }
              >
                <span>
                  {entry.medal && entry.medal !== "NONE"
                    ? `${MEDAL_EMOJI[entry.medal as Exclude<Medal, "NONE">]} `
                    : ""}
                  {entry.athlete?.user?.name ?? entry.athlete?.user?.email}
                  {entry.weightClass ? ` · ${entry.weightClass}` : ""}
                  {tab === "past" && entry.finalPosition
                    ? ` · ${entry.finalPosition}º lugar`
                    : ""}
                </span>
                {tab === "upcoming" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveEntry(entry.id);
                    }}
                    className="text-danger-500 hover:text-red-700 text-xs"
                  >
                    Remover
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export const Competitions: React.FC = () => {
  const [tab, setTab] = useState<Tab>("upcoming");
  const { data, loading, error, refetch } = useQuery(GET_COMPETITIONS, {
    variables:
      tab === "upcoming" ? { upcoming: true } : { past: true },
    fetchPolicy: "network-only",
  });

  const [deleteCompetition] = useMutation(DELETE_COMPETITION);
  const [removeEntry] = useMutation(REMOVE_ENTRY);

  const [openCreate, setOpenCreate] = useState(false);
  const [competitionToEdit, setCompetitionToEdit] = useState<any>(null);
  const [competitionToDelete, setCompetitionToDelete] = useState<any>(null);
  const [competitionToRegister, setCompetitionToRegister] =
    useState<any>(null);
  const [summaryEntry, setSummaryEntry] = useState<{
    entry: any;
    competitionName: string;
  } | null>(null);

  const competitions = data?.competitions ?? [];

  const handleConfirmDelete = async () => {
    if (!competitionToDelete) return;
    try {
      await deleteCompetition({ variables: { id: competitionToDelete.id } });
      toast.success("Competição excluída");
      setCompetitionToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao excluir competição");
    }
  };

  const handleRemoveEntry = async (entryId: string) => {
    try {
      await removeEntry({ variables: { id: entryId } });
      toast.success("Inscrição removida");
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao remover inscrição");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      <header className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link
              to="/"
              className="text-sm text-[var(--brand-600)] hover:underline"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">
              Competições
            </h1>
          </div>
          <Button onClick={() => setOpenCreate(true)}>+ Competição</Button>
        </div>

        <div className="flex gap-2 mt-6 border-b border-gray-200">
          <button
            onClick={() => setTab("upcoming")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === "upcoming"
                ? "border-[var(--brand-600)] text-[var(--brand-600)]"
                : "border-transparent text-text-muted"
            }`}
          >
            Calendário
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === "past"
                ? "border-[var(--brand-600)] text-[var(--brand-600)]"
                : "border-transparent text-text-muted"
            }`}
          >
            Histórico
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        {loading && (
          <div className="text-center py-8 text-text-muted text-sm">
            Carregando competições...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
            Erro ao carregar competições
          </div>
        )}
        {!loading && competitions.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            {tab === "upcoming"
              ? "Nenhuma competição futura cadastrada."
              : "Nenhuma competição passada registrada."}
          </div>
        )}

        {competitions.map((c: any) => (
          <CompetitionCard
            key={c.id}
            competition={c}
            tab={tab}
            onEdit={() => setCompetitionToEdit(c)}
            onDelete={() => setCompetitionToDelete(c)}
            onRegister={() => setCompetitionToRegister(c)}
            onRemoveEntry={handleRemoveEntry}
            onOpenSummary={(entry) =>
              setSummaryEntry({ entry, competitionName: c.name })
            }
          />
        ))}
      </main>

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Criar Competição"
      >
        <CompetitionForm
          onSuccess={() => {
            setOpenCreate(false);
            refetch();
          }}
          onCancel={() => setOpenCreate(false)}
        />
      </Modal>

      <Modal
        open={Boolean(competitionToEdit)}
        onClose={() => setCompetitionToEdit(null)}
        title={`Editar Competição: ${competitionToEdit?.name ?? ""}`}
      >
        {competitionToEdit && (
          <CompetitionForm
            competition={competitionToEdit}
            onSuccess={() => {
              setCompetitionToEdit(null);
              refetch();
            }}
            onCancel={() => setCompetitionToEdit(null)}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(competitionToRegister)}
        onClose={() => setCompetitionToRegister(null)}
        title={`Inscrever atletas: ${competitionToRegister?.name ?? ""}`}
      >
        {competitionToRegister && (
          <RegisterEntryForm
            competitionId={competitionToRegister.id}
            registeredAthleteIds={(competitionToRegister.entries ?? []).map(
              (e: any) => e.athleteId,
            )}
            onSuccess={() => {
              setCompetitionToRegister(null);
              refetch();
            }}
            onCancel={() => setCompetitionToRegister(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(competitionToDelete)}
        onClose={() => setCompetitionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Competição"
        message={`Tem certeza que deseja excluir "${competitionToDelete?.name}"? Todas as inscrições relacionadas também serão removidas.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      {summaryEntry && (
        <EntrySummaryModal
          entry={summaryEntry.entry}
          athleteName={
            summaryEntry.entry.athlete?.user?.name ??
            summaryEntry.entry.athlete?.user?.email ??
            "Atleta"
          }
          competitionName={summaryEntry.competitionName}
          open={Boolean(summaryEntry)}
          onClose={() => setSummaryEntry(null)}
          onResultSaved={() => refetch()}
        />
      )}
    </div>
  );
};

export default Competitions;
