import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ATHLETES } from "../graphql/queries";
import { useAuth } from "../contexts/AuthContext";

export const Dashboard: React.FC = () => {
  const { data, loading, error } = useQuery(GET_ATHLETES);
  const { user, signOut } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Judô Tracker</h1>
        <div>
          <span className="mr-4">{user?.email}</span>
          <button
            onClick={() => signOut()}
            className="py-1 px-3 bg-red-500 text-white rounded"
          >
            Sair
          </button>
        </div>
      </div>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-4">Atletas</h2>
        {loading && <div>Carregando atletas...</div>}
        {error && (
          <div className="text-red-600">Erro: {String(error.message)}</div>
        )}
        {data?.athletes?.length === 0 && <div>Nenhum atleta encontrado.</div>}
        {data?.athletes?.length > 0 && (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left">Nome/Email</th>
                <th className="border px-2 py-1">Altura (cm)</th>
                <th className="border px-2 py-1">Peso padrão (kg)</th>
              </tr>
            </thead>
            <tbody>
              {data.athletes.map((a: any) => (
                <tr key={a.id}>
                  <td className="border px-2 py-1">
                    {a.user?.name ?? a.user?.email}
                  </td>
                  <td className="border px-2 py-1">{a.heightCm ?? "-"}</td>
                  <td className="border px-2 py-1">
                    {a.defaultWeightKg ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
