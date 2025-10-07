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

export const Dashboard: React.FC = () => {
  const { data, loading, error } = useQuery(GET_ATHLETES, {
    fetchPolicy: "network-only",
  });
  const { user, signOut } = useAuth();

  // modal states
  const [openCreateAthlete, setOpenCreateAthlete] = useState(false);
  const [openRecordWeigh, setOpenRecordWeigh] = useState(false);

  // athlete detail modal
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(
    null
  );
  const [openAthleteDetail, setOpenAthleteDetail] = useState(false);

  // search filter (client-side)
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

  /**
   * computeAge
   * Recebe dobValue que pode ser:
   *  - null/undefined
   *  - string ISO "YYYY-MM-DD" ou "YYYY-MM-DDTHH:MM:SSZ"
   *  - número (timestamp em ms)
   *  - string numérica representando timestamp
   * Retorna: número de anos (integer) ou '-' se não puder calcular.
   */
  const computeAge = (dobValue?: string | number | null) => {
    // debugging (remova depois)
    // console.log('Computing age for dobValue:', dobValue);

    if (dobValue == null) return "-";

    try {
      let parsed: Date | null = null;

      if (typeof dobValue === "number") {
        parsed = new Date(dobValue);
      } else if (typeof dobValue === "string") {
        // numeric string? (timestamp)
        if (/^\d+$/.test(dobValue)) {
          parsed = new Date(Number(dobValue));
        } else {
          // try parse ISO or YYYY-MM-DD
          // parseISO lida com YYYY-MM-DD e ISO strings
          try {
            parsed = parseISO(dobValue);
            if (isNaN(parsed.getTime())) {
              // fallback: try Date constructor
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

      const years = differenceInYears(new Date(), parsed);
      return years;
    } catch (err) {
      console.warn("computeAge error:", err);
      return "-";
    }
  };

  // export CSV util (inclui idade)
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
      ...rows.map((r: { [x: string]: any }) =>
        headers.map((h) => `"${String(r[h] ?? "")}"`).join(",")
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
        className="bg-cover bg-center py-12 px-6 relative min-h-[200px] flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/images/judo-background.png)",
        }}
      >
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-white mb-4">
            Dashboard Judô Tracker
          </h1>
          <div className="w-24 h-0.5 bg-white mx-auto"></div>
        </div>
      </header>

      {/* User info */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <span className="text-gray-700 text-sm font-medium">{user?.email}</span>
        <button
          onClick={() => signOut()}
          className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition duration-200"
        >
          Sair
        </button>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto py-8 px-6">
        {/* Actions */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => setOpenCreateAthlete(true)}>
            + Criar Atleta
          </Button>
          <Button onClick={() => setOpenRecordWeigh(true)} variant="secondary">
            + Registrar Pesagem
          </Button>

          <div className="ml-auto flex items-center gap-3">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar atleta por nome ou email"
              className="p-2 border rounded"
            />
            <Button onClick={exportCSV} variant="ghost">
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Cards area */}
        <div className="mb-6">
          <Card>
            <h2 className="font-semibold mb-2">Resumo</h2>
            <div className="text-sm text-slate-600">
              Total de atletas: <strong>{athletes.length}</strong>
            </div>
            <div className="text-sm text-slate-600 mt-2">
              Última atualização: <strong>{new Date().toLocaleString()}</strong>
            </div>
          </Card>
        </div>

        {/* Athletes table */}
        <section className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Atletas</h2>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Carregando atletas...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-700 font-medium">
                Erro ao carregar dados
              </div>
              <div className="text-red-600 text-sm mt-1">
                {String(error.message)}
              </div>
            </div>
          )}

          {!loading && filtered?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum atleta encontrado.
            </div>
          )}

          {!loading && filtered?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-gray-700 font-semibold">
                      Nome/Email
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-gray-700 font-semibold">
                      Altura (cm)
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-gray-700 font-semibold">
                      Peso padrão (kg)
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-gray-700 font-semibold">
                      Idade
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-gray-700 font-semibold">
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
                      <td className="border border-gray-200 px-4 py-3 text-gray-800">
                        {a.user?.name ?? a.user?.email}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">
                        {a.heightCm ?? "-"}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">
                        {a.defaultWeightKg ?? "-"}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">
                        {computeAge(a.dob)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-600">
                        {a.coach?.user?.name ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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
    </div>
  );
};

export default Dashboard;

/* ModalWrapper (se você mantiver no final do mesmo arquivo) */
import { Modal } from "../ui/components/Modal";
import { parseISO } from "date-fns/parseISO";

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
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="py-2">{children}</div>
    </Modal>
  );
};
