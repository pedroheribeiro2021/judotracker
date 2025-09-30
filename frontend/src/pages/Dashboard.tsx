import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ATHLETES } from "../graphql/queries";
import { useAuth } from "../contexts/AuthContext";

export const Dashboard: React.FC = () => {
  const { data, loading, error } = useQuery(GET_ATHLETES);
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header limpo apenas com a imagem e título */}
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

      {/* User info fixo no canto superior direito */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <span className="text-gray-700 text-sm font-medium">{user?.email}</span>
        <button
          onClick={() => signOut()}
          className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition duration-200"
        >
          Sair
        </button>
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto py-8 px-6">
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

          {data?.athletes?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum atleta encontrado.
            </div>
          )}

          {data?.athletes?.length > 0 && (
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
                  </tr>
                </thead>
                <tbody>
                  {data.athletes.map((a: any) => (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 transition duration-150"
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
