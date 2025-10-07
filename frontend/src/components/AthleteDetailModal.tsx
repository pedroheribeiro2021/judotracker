// frontend/src/components/AthleteDetailModal.tsx
import React from "react";
import { useQuery } from "@apollo/client";
import { Modal } from "../ui/components/Modal";
import { GET_ATHLETE, GET_WEIGHINS } from "../graphql/queries";
import { Card } from "../ui";
import { format } from "date-fns";

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

export const AthleteDetailModal: React.FC<Props> = ({
  athleteId,
  open,
  onClose,
}) => {
  const skipQuery = !open || !athleteId;
  const {
    data: athleteData,
    loading: athleteLoading,
    error: athleteError,
  } = useQuery(GET_ATHLETE, {
    variables: { id: athleteId as any },
    skip: skipQuery,
    fetchPolicy: "network-only",
  });

  const { data: weighData, loading: weighLoading } = useQuery(GET_WEIGHINS, {
    variables: { athleteId: athleteId as any },
    skip: skipQuery,
    fetchPolicy: "network-only",
  });

  const athlete = athleteData?.athlete;

  return (
    <Modal
      open={open}
      onClose={onClose}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <div className="text-sm text-slate-600">Email</div>
                <div className="font-medium">{athlete.user?.email}</div>
              </Card>
              <Card>
                <div className="text-sm text-slate-600">Data de Nascimento</div>
                <div className="font-medium">
                  {safeFormat(athlete.dob ?? null, "dd/MM/yyyy")}
                </div>
              </Card>
              <Card>
                <div className="text-sm text-slate-600">Altura (cm)</div>
                <div className="font-medium">{athlete.heightCm ?? "-"}</div>
              </Card>
              <Card>
                <div className="text-sm text-slate-600">Peso padrão (kg)</div>
                <div className="font-medium">
                  {athlete.defaultWeightKg ?? "-"}
                </div>
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
                      <tr>
                        <th className="text-left text-sm px-3 py-2">Data</th>
                        <th className="text-left text-sm px-3 py-2">
                          Peso (kg)
                        </th>
                        <th className="text-left text-sm px-3 py-2">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weighData.weighIns.map((w: any) => (
                        <tr key={w.id} className="odd:bg-surface-200">
                          <td className="px-3 py-2 text-sm">
                            {safeFormat(
                              w.recordedAt ?? null,
                              "dd/MM/yyyy HH:mm"
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">{w.weightKg}</td>
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
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AthleteDetailModal;
