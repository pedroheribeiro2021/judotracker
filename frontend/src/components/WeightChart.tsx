// frontend/src/components/WeightChart.tsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useQuery } from "@apollo/client";
import { GET_WEIGHINS } from "../graphql/queries";
import { format } from "date-fns";

// Cores para as linhas de cada atleta
const LINE_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#65a30d",
  "#ea580c",
  "#9333ea",
];

type Athlete = {
  id: string;
  user?: { name?: string; email?: string };
};

type Props = {
  athletes: Athlete[]; // atletas filtrados (ou todos se sem filtro)
  allAthletes: Athlete[]; // todos os atletas (para referência)
};

// Componente interno que busca pesagens de UM atleta
const AthleteWeighIns: React.FC<{
  athlete: Athlete;
  color: string;
  onData: (id: string, data: { date: string; weight: number }[]) => void;
}> = ({ athlete, color, onData }) => {
  const { data } = useQuery(GET_WEIGHINS, {
    variables: { athleteId: athlete.id },
    fetchPolicy: "cache-first",
    onCompleted: (d) => {
      const points = (d?.weighIns ?? [])
        .map((w: any) => ({
          date: w.recordedAt,
          weight: w.weightKg,
        }))
        .sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      onData(athlete.id, points);
    },
  });
  return null; // só busca dados, não renderiza nada
};

const WeightChart: React.FC<Props> = ({ athletes, allAthletes }) => {
  const [weighInMap, setWeighInMap] = React.useState<
    Record<string, { date: string; weight: number }[]>
  >({});

  const handleData = React.useCallback(
    (id: string, data: { date: string; weight: number }[]) => {
      setWeighInMap((prev) => ({ ...prev, [id]: data }));
    },
    [],
  );

  // Monta um dataset unificado por data para o LineChart
  // Cada ponto tem { date, [athleteId]: weight }
  const chartData = useMemo(() => {
    const dateMap: Record<string, Record<string, number>> = {};

    athletes.forEach((a) => {
      const points = weighInMap[a.id] ?? [];
      points.forEach((p) => {
        const dateKey = format(new Date(p.date), "dd/MM/yy");
        if (!dateMap[dateKey]) dateMap[dateKey] = {};
        dateMap[dateKey][a.id] = p.weight;
      });
    });

    return Object.entries(dateMap)
      .map(([date, weights]) => ({ date, ...weights }))
      .sort((a, b) => {
        // ordenar por data
        const [da, ma, ya] = a.date.split("/").map(Number);
        const [db, mb, yb] = b.date.split("/").map(Number);
        return (
          new Date(2000 + ya, ma - 1, da).getTime() -
          new Date(2000 + yb, mb - 1, db).getTime()
        );
      });
  }, [athletes, weighInMap]);

  const hasData = chartData.length > 0;

  const athleteName = (a: Athlete) => a.user?.name ?? a.user?.email ?? a.id;

  // Função customizada para o tooltip
  const customTooltipFormatter = (value: any, name: string | undefined) => {
    // Se name for undefined, retorna valor padrão
    if (!name) return [`${value} kg`, "Desconhecido"];

    const athlete = athletes.find((a) => a.id === name);
    const displayName = athlete ? athleteName(athlete) : name;

    // Retorna um array com dois elementos ReactNode
    return [`${value} kg`, displayName];
  };

  // Função customizada para a legenda
  const customLegendFormatter = (value: string) => {
    const athlete = athletes.find((a) => a.id === value);
    return athlete ? athleteName(athlete) : value;
  };

  return (
    <>
      {/* Renderiza os fetchers invisíveis para cada atleta */}
      {allAthletes.map((a, i) => (
        <AthleteWeighIns
          key={a.id}
          athlete={a}
          color={LINE_COLORS[i % LINE_COLORS.length]}
          onData={handleData}
        />
      ))}

      <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
          Evolução de Peso
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {athletes.length === allAthletes.length
            ? "Todos os atletas"
            : `${athletes.length} atleta${athletes.length !== 1 ? "s" : ""} filtrado${athletes.length !== 1 ? "s" : ""}`}
        </p>

        {!hasData && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Nenhuma pesagem registrada para os atletas selecionados.
          </div>
        )}

        {hasData && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}kg`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                formatter={
                  ((value: any, name: string | undefined) => {
                    if (!name) return [`${value} kg`, "Desconhecido"];
                    const athlete = athletes.find((a) => a.id === name);
                    const displayName = athlete ? athleteName(athlete) : name;
                    return [`${value} kg`, displayName];
                  }) as any
                }
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Legend
                formatter={customLegendFormatter}
                wrapperStyle={{ fontSize: 12 }}
              />
              {athletes.map((a, i) => (
                <Line
                  key={a.id}
                  type="monotone"
                  dataKey={a.id}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>
    </>
  );
};

export default WeightChart;
