// frontend/src/components/EditAthleteForm.tsx
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_ATHLETE, GET_COACHES, GET_ATHLETES } from "../graphql/queries";
import toast from "react-hot-toast";

type Props = {
  athlete: any;
  onSuccess: () => void;
  onCancel: () => void;
};

export const EditAthleteForm: React.FC<Props> = ({ athlete, onSuccess, onCancel }) => {
  const { data: coachesData } = useQuery(GET_COACHES);
  const [updateAthlete, { loading }] = useMutation(UPDATE_ATHLETE);

  const [formData, setFormData] = useState({
    heightCm: athlete?.heightCm || "",
    defaultWeightKg: athlete?.defaultWeightKg || "",
    coachId: athlete?.coach?.id || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateAthlete({
        variables: {
          input: {
            id: athlete.id,
            heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
            defaultWeightKg: formData.defaultWeightKg ? parseFloat(formData.defaultWeightKg) : null,
            coachId: formData.coachId || null,
          },
        },
        refetchQueries: [{ query: GET_ATHLETES }],
      });
      
      toast.success("Atleta atualizado com sucesso!");
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao atualizar atleta:", error);
      toast.error(error.message || "Erro ao atualizar atleta");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-default)] mb-1">
          Altura (cm)
        </label>
        <input
          type="number"
          step="0.01"
          name="heightCm"
          value={formData.heightCm}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)] transition"
          placeholder="Ex: 175.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-default)] mb-1">
          Peso padrão (kg)
        </label>
        <input
          type="number"
          step="0.1"
          name="defaultWeightKg"
          value={formData.defaultWeightKg}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)] transition"
          placeholder="Ex: 70.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-default)] mb-1">
          Treinador
        </label>
        <select
          name="coachId"
          value={formData.coachId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)] transition bg-white"
        >
          <option value="">Sem treinador</option>
          {coachesData?.coaches.map((coach: any) => (
            <option key={coach.id} value={coach.id}>
              {coach.user?.name || coach.user?.email || coach.id}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 font-medium"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[var(--surface-200)] hover:bg-gray-300 text-[var(--text-default)] py-2 px-4 rounded-md transition duration-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};