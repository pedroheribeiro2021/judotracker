// frontend/src/pages/Dashboard.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ATHLETES } from "../graphql/queries";
import { useAuth } from "../contexts/AuthContext";
import CreateAthleteForm from "../components/CreateAthleteForm";
import RecordWeighInForm from "../components/RecordWeighInForm";
import AthleteDetailModal from "../components/AthleteDetailModal";
import { Card } from "../ui";
import { Button } from "../ui";
import toast from "react-hot-toast";
import { differenceInYears } from "date-fns";
import { Modal } from "../ui/components/Modal";
import { parseISO } from "date-fns/parseISO";
import WeightChart from "../components/WeightChart";
import CreateCoachForm from "../components/CreateCoachForm";

export const Dashboard: React.FC = () => {
  const { data, loading, error } = useQuery(GET_ATHLETES, {
    fetchPolicy: "network-only",
  });
  const { user, signOut } = useAuth();

  const [openCreateAthlete, setOpenCreateAthlete] = useState(false);
  const [openRecordWeigh, setOpenRecordWeigh] = useState(false);
  const [openCreateCoach, setOpenCreateCoach] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(
    null,
  );
  const [openAthleteDetail, setOpenAthleteDetail] = useState(false);
  const [q, setQ] = useState("");

  const athletes = data?.athletes ?? [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return athletes;
    return athletes.filter((a: any) => {
      const name = (a.user?.name ?? "").toLowerCase();
      const email = (a.user?.email ?? "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [athletes, q]);

  const computeAge = (dobValue?: string | number | null) => {
    if (dobValue == null) return "-";
    try {
      let parsed: Date | null = null;
      if (typeof dobValue === "number") {
        parsed = new Date(dobValue);
      } else if (typeof dobValue === "string") {
        if (/^\d+$/.test(dobValue)) {
          parsed = new Date(Number(dobValue));
        } else {
          try {
            parsed = parseISO(dobValue);
            if (isNaN(parsed.getTime())) {
              const alt = new Date(dobValue);
              parsed = isNaN(alt.getTime()) ? null : alt;
            }
          } catch {
            const alt = new Date(dobValue);
            parsed = isNaN(alt.getTime()) ? null : alt;
          }
        }
      }
      if (!parsed || isNaN(parsed.getTime())) return "-";
      return differenceInYears(new Date(), parsed);
    } catch {
      return "-";
    }
  };

  const exportCSV = () => {
    if (!athletes?.length) {
      toast.error("Nenhum atleta para exportar");
      return;
    }
    const rows = athletes.map((a: any) => ({
      id: a.id,
      name: a.user?.name ?? "",
      email: a.user?.email ?? "",
      dob: a.dob ?? "",
      age: computeAge(a.dob),
      heightCm: a.heightCm ?? "",
      defaultWeightKg: a.defaultWeightKg ?? "",
      coach: a.coach?.user?.name ?? a.coach?.user?.email ?? "",
    }));
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r: any) =>
        headers.map((h) => `"${String(r[h] ?? "")}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `athletes_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onRowClick = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setOpenAthleteDetail(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-cover bg-center py-10 sm:py-12 px-4 sm:px-6 relative min-h-[160px] sm:min-h-[200px] flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/images/judo-background.png)",
        }}
      >
        <div className="text-center flex-1 pt-10 sm:pt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            Dashboard Judô Tracker
          </h1>
          <div className="w-24 h-0.5 bg-white mx-auto"></div>
        </div>
      </header>

      {/* User info bar */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 sm:gap-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg">
        <span className="text-gray-700 text-xs sm:text-sm font-medium hidden sm:block">
          {user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="py-1 px-2 sm:px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm font-medium transition duration-200"
        >
          Sair
        </button>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6">
          <Button
            onClick={() => setOpenCreateAthlete(true)}
            className="text-sm sm:text-base"
          >
            + Atleta
          </Button>
          <Button
            onClick={() => setOpenRecordWeigh(true)}
            variant="secondary"
            className="text-sm sm:text-base"
          >
            + Pesagem
          </Button>
          <Button
            onClick={() => setOpenCreateCoach(true)}
            variant="secondary"
            className="text-sm sm:text-base"
          >
            + Treinador
          </Button>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar atleta..."
              className="flex-1 sm:flex-none p-2 border rounded text-sm"
            />
            <Button
              onClick={exportCSV}
              variant="ghost"
              className="text-sm whitespace-nowrap"
            >
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Summary card */}
        <div className="mb-6">
          <Card>
            <h2 className="font-semibold mb-2 text-sm sm:text-base">Resumo</h2>
            <div className="text-sm text-slate-600">
              Total de atletas: <strong>{athletes.length}</strong>
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Última atualização: <strong>{new Date().toLocaleString()}</strong>
            </div>
          </Card>
        </div>

        {/* Athletes table */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Atletas
          </h2>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 text-sm">
                Carregando atletas...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-700 font-medium text-sm">
                Erro ao carregar dados
              </div>
              <div className="text-red-600 text-xs mt-1">
                {String(error.message)}
              </div>
            </div>
          )}

          {!loading && filtered?.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum atleta encontrado.
            </div>
          )}

          {!loading && filtered?.length > 0 && (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full table-auto border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold text-sm">
                      Nome/Email
                    </th>
                    <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold text-sm hidden sm:table-cell">
                      Altura (cm)
                    </th>
                    <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold text-sm">
                      Peso (kg)
                    </th>
                    <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold text-sm hidden md:table-cell">
                      Idade
                    </th>
                    <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold text-sm">
                      Treinador
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a: any) => (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 transition duration-150 cursor-pointer"
                      onClick={() => onRowClick(a.id)}
                    >
                      <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-800 text-sm">
                        {a.user?.name ?? a.user?.email}
                      </td>
                      <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm hidden sm:table-cell">
                        {a.heightCm ?? "-"}
                      </td>
                      <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm">
                        {a.defaultWeightKg ?? "-"}
                      </td>
                      <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm hidden md:table-cell">
                        {computeAge(a.dob)}
                      </td>
                      <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm">
                        {a.coach?.user?.name ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Weight chart */}
        {!loading && athletes.length > 0 && (
          <WeightChart athletes={filtered} allAthletes={athletes} />
        )}
      </main>

      {/* Modals */}
      <AthleteDetailModal
        athleteId={selectedAthleteId}
        open={openAthleteDetail}
        onClose={() => setOpenAthleteDetail(false)}
      />

      <ModalWrapper
        open={openCreateAthlete}
        onClose={() => setOpenCreateAthlete(false)}
        title="Criar Atleta"
      >
        <CreateAthleteForm
          onSuccess={() => {
            setOpenCreateAthlete(false);
            toast.success("Atleta criado");
          }}
        />
      </ModalWrapper>

      <ModalWrapper
        open={openRecordWeigh}
        onClose={() => setOpenRecordWeigh(false)}
        title="Registrar Pesagem"
      >
        <RecordWeighInForm />
      </ModalWrapper>

      <ModalWrapper
        open={openCreateCoach}
        onClose={() => setOpenCreateCoach(false)}
        title="Criar Treinador"
      >
        <CreateCoachForm
          onSuccess={() => {
            setOpenCreateCoach(false);
            toast.success("Treinador criado");
          }}
        />
      </ModalWrapper>
    </div>
  );
};

export default Dashboard;

/* ModalWrapper */
type MWProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export const ModalWrapper: React.FC<MWProps> = ({
  open,
  onClose,
  title,
  children,
}) => (
  <Modal open={open} onClose={onClose} title={title}>
    <div className="py-2">{children}</div>
  </Modal>
);
