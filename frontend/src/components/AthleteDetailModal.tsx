// frontend/src/components/AthleteDetailModal.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { Modal } from "../ui/components/Modal";
import {
  GET_ATHLETE,
  GET_WEIGHINS,
  GET_PROMOTIONS,
  DELETE_PROMOTION,
} from "../graphql/queries";
import { Card, Button } from "../ui";
import { format, differenceInMonths } from "date-fns";
import toast from "react-hot-toast";
import { EditAthleteForm } from "./EditAthleteForm";
import { PromotionForm } from "./PromotionForm";
import { BeltBadge } from "./BeltBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { MEDAL_EMOJI, Medal } from "../domain/matchEnums";
import { AGE_DIVISION_LABELS } from "../domain/ageDivisions";
import { BELT_RANK_LABELS, BeltRank } from "../domain/beltRanks";

type Props = {
  athleteId: string | null;
  open: boolean;
  onClose: () => void;
};

function parseFlexibleDate(v?: string | number | null): Date | null {
  if (v == null) return null;
  // if number (timestamp in ms)
  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  // if numeric string (timestamp)
  if (typeof v === "string" && /^\d+$/.test(v)) {
    const d = new Date(Number(v));
    return isNaN(d.getTime()) ? null : d;
  }
  // otherwise try as ISO or YYYY-MM-DD
  const d = new Date(v);
  if (!isNaN(d.getTime())) return d;
  // try replacing space-only formats or UTC hint
  try {
    const alt = v.replace(" ", "T");
    const d2 = new Date(alt);
    return isNaN(d2.getTime()) ? null : d2;
  } catch {
    return null;
  }
}

function safeFormat(dateVal?: string | number | null, pattern = "dd/MM/yyyy") {
  if (dateVal == null) return "-";
  const d = parseFlexibleDate(dateVal);
  if (!d) return "-";
  try {
    return format(d, pattern);
  } catch {
    return d.toLocaleDateString();
  }
}

/** Tempo decorrido desde uma data, formatado como "1 ano e 3 meses" (indicador de carência). */
function formatTenure(dateVal?: string | number | null): string | null {
  const d = parseFlexibleDate(dateVal ?? null);
  if (!d) return null;
  const totalMonths = Math.max(0, differenceInMonths(new Date(), d));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0 && months === 0) return "há menos de 1 mês";
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ano${years !== 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mês${months !== 1 ? "es" : ""}`);
  return `há ${parts.join(" e ")}`;
}

export const AthleteDetailModal: React.FC<Props> = ({
  athleteId,
  open,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [openPromotionForm, setOpenPromotionForm] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<any>(null);
  const skipQuery = !open || !athleteId;

  const {
    data: athleteData,
    loading: athleteLoading,
    error: athleteError,
    refetch: refetchAthlete,
  } = useQuery(GET_ATHLETE, {
    variables: { id: athleteId as any },
    skip: skipQuery,
    fetchPolicy: "network-only",
  });

  const {
    data: weighData,
    loading: weighLoading,
    refetch: refetchWeigh,
  } = useQuery(GET_WEIGHINS, {
    variables: { athleteId: athleteId as any },
    skip: skipQuery,
    fetchPolicy: "network-only",
  });

  const {
    data: promotionsData,
    loading: promotionsLoading,
    refetch: refetchPromotions,
  } = useQuery(GET_PROMOTIONS, {
    variables: { athleteId: athleteId as any },
    skip: skipQuery,
    fetchPolicy: "network-only",
  });

  const [deletePromotion] = useMutation(DELETE_PROMOTION);

  const athlete = athleteData?.athlete;
  const promotions = promotionsData?.promotions ?? [];

  const handleEditSuccess = () => {
    setIsEditing(false);
    refetchAthlete();
    refetchWeigh();
  };

  const handleDeletePromotion = async () => {
    if (!promotionToDelete) return;
    try {
      await deletePromotion({ variables: { id: promotionToDelete.id } });
      toast.success("Graduação removida");
      setPromotionToDelete(null);
      refetchPromotions();
      refetchAthlete();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao remover graduação");
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        athlete ? `${athlete.user?.name ?? athlete.user?.email}` : "Atleta"
      }
    >
      <div className="space-y-4">
        {athleteLoading && <div>Carregando atleta...</div>}
        {athleteError && (
          <div className="text-red-600">Erro ao carregar atleta</div>
        )}

        {athlete && (
          <div>
            {/* Botão de editar */}
            {!isEditing && (
              <div className="flex justify-end gap-2 mb-4">
                <Link
                  to={`/athletes/${athlete.id}`}
                  className="bg-[var(--surface-200)] hover:bg-gray-300 text-[var(--text-default)] px-4 py-2 rounded-md transition duration-200 text-sm flex items-center font-medium"
                >
                  Ver estatísticas
                </Link>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white px-4 py-2 rounded-md transition duration-200 text-sm flex items-center gap-2 font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar Atleta
                </button>
              </div>
            )}

            {/* Formulário de edição */}
            {isEditing && (
              <div className="mb-6">
                <EditAthleteForm
                  athlete={athlete}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            )}

            {/* Dados do atleta (modo visual) */}
            {!isEditing && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Card>
                    <div className="text-sm text-slate-600">Email</div>
                    <div className="font-medium">{athlete.user?.email}</div>
                  </Card>
                  <Card>
                    <div className="text-sm text-slate-600">
                      Data de Nascimento
                    </div>
                    <div className="font-medium">
                      {safeFormat(athlete.dob ?? null, "dd/MM/yyyy")}
                    </div>
                  </Card>
                  <Card>
                    <div className="text-sm text-slate-600">Altura (cm)</div>
                    <div className="font-medium">{athlete.heightCm ?? "-"}</div>
                  </Card>
                  <Card>
                    <div className="text-sm text-slate-600">
                      Peso padrão (kg)
                    </div>
                    <div className="font-medium">
                      {athlete.defaultWeightKg ?? "-"}
                    </div>
                  </Card>
                  <Card>
                    <div className="text-sm text-slate-600">Classe etária</div>
                    <div className="font-medium">
                      {athlete.ageDivision
                        ? (AGE_DIVISION_LABELS[athlete.ageDivision] ??
                          athlete.ageDivision)
                        : "-"}
                    </div>
                  </Card>
                  <Card>
                    <div className="text-sm text-slate-600">
                      Categoria de peso atual
                    </div>
                    <div className="font-medium">
                      {athlete.currentWeightClass ?? "-"}
                    </div>
                  </Card>
                  <Card>
                    <div className="text-sm text-slate-600">Faixa atual</div>
                    <div className="font-medium">
                      {athlete.currentBelt ? (
                        <BeltBadge rank={athlete.currentBelt} />
                      ) : (
                        "-"
                      )}
                    </div>
                    {athlete.currentBelt && promotions[0]?.promotedAt && (
                      <div className="text-xs text-slate-500 mt-1">
                        Nesta faixa {formatTenure(promotions[0].promotedAt)}
                      </div>
                    )}
                  </Card>
                  <Card className="md:col-span-2">
                    <div className="text-sm text-slate-600">Treinador</div>
                    <div className="font-medium">
                      {athlete.coach?.user?.name ??
                        athlete.coach?.user?.email ??
                        "-"}
                    </div>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Histórico de Pesagens
                  </h3>
                  {weighLoading && <div>Carregando histórico...</div>}
                  {!weighLoading && !weighData?.weighIns?.length && (
                    <div className="text-sm text-slate-500">
                      Nenhuma pesagem registrada.
                    </div>
                  )}
                  {weighData?.weighIns?.length > 0 && (
                    <div className="overflow-auto max-h-64">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left text-sm px-3 py-2">
                              Data
                            </th>
                            <th className="text-left text-sm px-3 py-2">
                              Peso (kg)
                            </th>
                            <th className="text-left text-sm px-3 py-2">
                              Notas
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {weighData.weighIns.map((w: any) => (
                            <tr key={w.id} className="odd:bg-gray-50">
                              <td className="px-3 py-2 text-sm">
                                {safeFormat(
                                  w.recordedAt ?? null,
                                  "dd/MM/yyyy HH:mm",
                                )}
                              </td>
                              <td className="px-3 py-2 text-sm">
                                {w.weightKg}
                              </td>
                              <td className="px-3 py-2 text-sm">
                                {w.notes ?? "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Competições</h3>
                  {!athlete.entries?.length && (
                    <div className="text-sm text-slate-500">
                      Nenhuma competição registrada.
                    </div>
                  )}
                  {athlete.entries?.length > 0 && (
                    <ul className="divide-y">
                      {athlete.entries.map((entry: any) => (
                        <li key={entry.id} className="py-2 text-sm">
                          <div className="font-medium">
                            {entry.medal && entry.medal !== "NONE"
                              ? `${MEDAL_EMOJI[entry.medal as Exclude<Medal, "NONE">]} `
                              : ""}
                            {entry.competition?.name}
                          </div>
                          <div className="text-slate-500">
                            {safeFormat(entry.competition?.date ?? null)}
                            {entry.competition?.location
                              ? ` · ${entry.competition.location}`
                              : ""}
                            {entry.weightClass
                              ? ` · ${entry.weightClass}`
                              : ""}
                            {entry.finalPosition
                              ? ` · ${entry.finalPosition}º lugar`
                              : ""}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Graduações</h3>
                    <Button size="sm" onClick={() => setOpenPromotionForm(true)}>
                      + Registrar graduação
                    </Button>
                  </div>
                  {promotionsLoading && (
                    <div className="text-sm text-slate-500">
                      Carregando graduações...
                    </div>
                  )}
                  {!promotionsLoading && promotions.length === 0 && (
                    <div className="text-sm text-slate-500">
                      Nenhuma graduação registrada.
                    </div>
                  )}
                  {promotions.length > 0 && (
                    <ul className="divide-y">
                      {promotions.map((p: any) => (
                        <li
                          key={p.id}
                          className="py-2 text-sm flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <BeltBadge rank={p.rank} />
                              <span className="text-slate-500">
                                {safeFormat(p.promotedAt)}
                              </span>
                            </div>
                            <div className="text-slate-500 mt-1">
                              {p.promotedBy ? `Outorgada por ${p.promotedBy}` : ""}
                              {p.notes ? ` · ${p.notes}` : ""}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-danger-500 hover:text-red-700 shrink-0"
                            onClick={() => setPromotionToDelete(p)}
                          >
                            Excluir
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Modal
        open={openPromotionForm}
        onClose={() => setOpenPromotionForm(false)}
        title="Registrar graduação"
      >
        {athlete && (
          <PromotionForm
            athleteId={athlete.id}
            onSuccess={() => {
              setOpenPromotionForm(false);
              refetchPromotions();
              refetchAthlete();
            }}
            onCancel={() => setOpenPromotionForm(false)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(promotionToDelete)}
        onClose={() => setPromotionToDelete(null)}
        onConfirm={handleDeletePromotion}
        title="Excluir graduação"
        message={`Tem certeza que deseja excluir a graduação "${
          promotionToDelete ? BELT_RANK_LABELS[promotionToDelete.rank as BeltRank] : ""
        }"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </Modal>
  );
};

export default AthleteDetailModal;
