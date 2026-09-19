// frontend/src/pages/AthletePage.tsx
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  GET_ATHLETE,
  GET_ATHLETE_STATS,
  GET_INJURIES,
  RESOLVE_INJURY,
} from "../graphql/queries";
import { Card, Avatar, Badge, Button } from "../ui";
import { Modal } from "../ui/components/Modal";
import { BeltBadge } from "../components/BeltBadge";
import { InjuryForm } from "../components/InjuryForm";
import WeightChart from "../components/WeightChart";
import { AGE_DIVISION_LABELS } from "../domain/ageDivisions";
import { SCORE_TYPE_LABELS, ScoreType, MEDAL_EMOJI, Medal } from "../domain/matchEnums";
import { INJURY_SEVERITY_LABELS, InjurySeverity } from "../domain/injuries";

// Cores fixas por scoreType (identidade, não ranking) — mesma ordem de
// SCORE_TYPES em domain/matchEnums.ts, nunca reatribuídas por posição no
// dataset filtrado.
const SCORE_TYPE_COLORS: Record<ScoreType, string> = {
  IPPON: "#2563EB",
  WAZA_ARI: "#16A34A",
  WAZA_ARI_AWASETE_IPPON: "#0891B2",
  DECISION: "#7C3AED",
  HANSOKU_MAKE: "#DC2626",
  FUSEN_GACHI: "#F97316",
};

function safeFormatDate(value?: string | null, pattern = "dd/MM/yyyy") {
  if (!value) return "-";
  try {
    return format(new Date(value), pattern);
  } catch {
    return "-";
  }
}

const KpiCard: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <Card>
    <div className="text-sm text-slate-600">{label}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
  </Card>
);

export const AthletePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: athleteData,
    loading: athleteLoading,
    error: athleteError,
    refetch: refetchAthlete,
  } = useQuery(GET_ATHLETE, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  });

  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(
    GET_ATHLETE_STATS,
    {
      variables: { athleteId: id },
      skip: !id,
      fetchPolicy: "network-only",
    },
  );

  const [openInjuryForm, setOpenInjuryForm] = useState(false);

  const {
    data: injuriesData,
    loading: injuriesLoading,
    refetch: refetchInjuries,
  } = useQuery(GET_INJURIES, {
    variables: { athleteId: id },
    skip: !id,
    fetchPolicy: "network-only",
  });
  const [resolveInjury] = useMutation(RESOLVE_INJURY);

  const athlete = athleteData?.athlete;
  const stats = statsData?.athleteStats;
  const injuries = injuriesData?.injuries ?? [];

  const handleResolveInjury = async (injuryId: string) => {
    try {
      await resolveInjury({ variables: { id: injuryId } });
      toast.success("Lesão marcada como resolvida");
      refetchInjuries();
      refetchAthlete();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao atualizar lesão");
    }
  };

  const pieData = (stats?.winsByScoreType ?? []).map((s: any) => ({
    name: SCORE_TYPE_LABELS[s.scoreType as ScoreType] ?? s.scoreType,
    scoreType: s.scoreType,
    value: s.count,
  }));

  const techniqueData = (stats?.topTechniques ?? []).map((t: any) => ({
    technique: t.technique,
    wins: t.wins,
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      <header className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <Link
          to="/"
          className="text-sm text-[var(--brand-600)] hover:underline"
        >
          ← Dashboard
        </Link>

        {athleteLoading && (
          <div className="mt-4 text-sm text-text-muted">
            Carregando atleta...
          </div>
        )}
        {athleteError && (
          <div className="mt-4 text-sm text-danger-500">
            Erro ao carregar atleta
          </div>
        )}

        {athlete && (
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Avatar alt={athlete.user?.name ?? athlete.user?.email} size="lg" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {athlete.user?.name ?? athlete.user?.email}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {athlete.status === "INJURED" && (
                  <Badge variant="danger">Lesionado</Badge>
                )}
                {athlete.currentBelt && <BeltBadge rank={athlete.currentBelt} />}
                {athlete.currentWeightClass && (
                  <Badge>{athlete.currentWeightClass}</Badge>
                )}
                {athlete.ageDivision && (
                  <Badge>
                    {AGE_DIVISION_LABELS[athlete.ageDivision] ?? athlete.ageDivision}
                  </Badge>
                )}
                {athlete.coach && (
                  <span className="text-sm text-text-muted">
                    Treinador: {athlete.coach.user?.name ?? athlete.coach.user?.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {statsError && (
          <div className="text-sm text-danger-500">
            Erro ao carregar estatísticas
          </div>
        )}

        {!statsLoading && stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Lutas" value={stats.totalMatches} />
              <KpiCard
                label="Vitórias / Derrotas"
                value={`${stats.wins} / ${stats.losses}`}
              />
              <KpiCard label="Taxa de vitória" value={`${stats.winRate}%`} />
              <KpiCard label="Vitórias por Ippon" value={stats.ipponWins} />
              <KpiCard
                label="Média de shidos/luta"
                value={stats.avgShidosPerMatch}
              />
              {stats.medalsByType.map((m: any) => (
                <KpiCard
                  key={m.medal}
                  label={`Medalhas (${m.medal})`}
                  value={`${MEDAL_EMOJI[m.medal as Exclude<Medal, "NONE">] ?? ""} ${m.count}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h2 className="font-semibold mb-3">Tipos de vitória</h2>
                {pieData.length === 0 ? (
                  <div className="text-sm text-text-muted py-8 text-center">
                    Sem vitórias registradas ainda.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        label
                      >
                        {pieData.map((entry: any) => (
                          <Cell
                            key={entry.scoreType}
                            fill={SCORE_TYPE_COLORS[entry.scoreType as ScoreType]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card>
                <h2 className="font-semibold mb-3">Técnicas mais vitoriosas</h2>
                {techniqueData.length === 0 ? (
                  <div className="text-sm text-text-muted py-8 text-center">
                    Sem técnicas registradas ainda.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={techniqueData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="technique"
                        width={100}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                      />
                      <Tooltip />
                      <Bar dataKey="wins" fill="#2563EB" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>
          </>
        )}

        {athlete?.attendanceStats && (
          <Card>
            <h2 className="font-semibold mb-3">Frequência nos treinos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-600">
                  Presença (30 dias)
                </div>
                <div className="text-xl font-semibold mt-1">
                  {athlete.attendanceStats.sessions30 > 0
                    ? `${athlete.attendanceStats.rate30}%`
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">
                  Presença (90 dias)
                </div>
                <div className="text-xl font-semibold mt-1">
                  {athlete.attendanceStats.sessions90 > 0
                    ? `${athlete.attendanceStats.rate90}%`
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Sequência atual</div>
                <div className="text-xl font-semibold mt-1">
                  {athlete.attendanceStats.currentStreak} treino
                  {athlete.attendanceStats.currentStreak !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </Card>
        )}

        {athlete && (
          <WeightChart athletes={[athlete]} allAthletes={[athlete]} />
        )}

        {athlete && (
          <Card>
            <h2 className="font-semibold mb-3">Linha do tempo de competições</h2>
            {!athlete.entries?.length && (
              <div className="text-sm text-text-muted">
                Nenhuma competição registrada.
              </div>
            )}
            {athlete.entries?.length > 0 && (
              <ol className="relative border-l border-gray-200 ml-2">
                {[...athlete.entries]
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.competition?.date ?? 0).getTime() -
                      new Date(a.competition?.date ?? 0).getTime(),
                  )
                  .map((entry: any) => (
                    <li key={entry.id} className="mb-4 ml-4">
                      <div className="absolute w-2 h-2 bg-[var(--brand-600)] rounded-full -left-1 mt-1.5" />
                      <div className="text-xs text-text-muted">
                        {safeFormatDate(entry.competition?.date)}
                      </div>
                      <div className="text-sm font-medium">
                        {entry.medal && entry.medal !== "NONE"
                          ? `${MEDAL_EMOJI[entry.medal as Exclude<Medal, "NONE">]} `
                          : ""}
                        {entry.competition?.name}
                      </div>
                      <div className="text-sm text-text-muted">
                        {entry.weightClass ? `${entry.weightClass}` : ""}
                        {entry.finalPosition ? ` · ${entry.finalPosition}º lugar` : ""}
                      </div>
                    </li>
                  ))}
              </ol>
            )}
          </Card>
        )}

        {athlete && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Lesões</h2>
              <Button size="sm" onClick={() => setOpenInjuryForm(true)}>
                + Registrar lesão
              </Button>
            </div>
            {injuriesLoading && (
              <div className="text-sm text-text-muted">
                Carregando lesões...
              </div>
            )}
            {!injuriesLoading && injuries.length === 0 && (
              <div className="text-sm text-text-muted">
                Nenhuma lesão registrada.
              </div>
            )}
            {injuries.length > 0 && (
              <ul className="divide-y">
                {injuries.map((injury: any) => {
                  const isActive = !injury.resolvedAt;
                  return (
                    <li key={injury.id} className="py-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">
                              {injury.bodyPart}
                            </span>
                            <Badge variant={isActive ? "danger" : "default"}>
                              {isActive ? "Ativa" : "Resolvida"}
                            </Badge>
                            <Badge>
                              {INJURY_SEVERITY_LABELS[
                                injury.severity as InjurySeverity
                              ] ?? injury.severity}
                            </Badge>
                          </div>
                          <div className="text-sm text-text-muted mt-1">
                            {injury.description}
                          </div>
                          <div className="text-xs text-text-muted mt-1">
                            Ocorrida em {safeFormatDate(injury.occurredAt)}
                            {injury.expectedReturn
                              ? ` · Retorno previsto ${safeFormatDate(injury.expectedReturn)}`
                              : ""}
                            {injury.resolvedAt
                              ? ` · Resolvida em ${safeFormatDate(injury.resolvedAt)}`
                              : ""}
                          </div>
                          {injury.notes && (
                            <div className="text-xs text-text-muted mt-1">
                              {injury.notes}
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleResolveInjury(injury.id)}
                          >
                            Marcar como resolvida
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        )}
      </main>

      <Modal
        open={openInjuryForm}
        onClose={() => setOpenInjuryForm(false)}
        title="Registrar lesão"
      >
        {athlete && (
          <InjuryForm
            athleteId={athlete.id}
            onSuccess={() => {
              setOpenInjuryForm(false);
              refetchInjuries();
              refetchAthlete();
            }}
            onCancel={() => setOpenInjuryForm(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default AthletePage;
