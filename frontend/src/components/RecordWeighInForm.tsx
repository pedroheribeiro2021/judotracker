// frontend/src/components/RecordWeighInForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { GET_ATHLETES, RECORD_WEIGHIN } from "../graphql/queries";
import { Button, Input } from "../ui";

const formSchema = z.object({
  athleteId: z.string().uuid({ message: "Selecione um atleta válido" }),
  weightKg: z
    .number({ message: "Informe um número" })
    .positive("Deve ser positivo"),
  recordedAt: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const RecordWeighInForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      athleteId: "",
      weightKg: undefined,
      recordedAt: "",
      notes: "",
    },
  });

  // buscar atletas para popular o select
  const {
    data: athletesData,
    loading: athletesLoading,
    error: athletesError,
  } = useQuery(GET_ATHLETES);

  const [recordWeighIn] = useMutation(RECORD_WEIGHIN);

  const onSubmit = async (values: FormValues) => {
    try {
      // GraphQL espera number; react-hook-form com valueAsNumber já transforma
      const payload: any = {
        athleteId: values.athleteId,
        weightKg: values.weightKg,
        recordedAt:
          values.recordedAt && values.recordedAt.length > 0
            ? values.recordedAt
            : null,
        notes: values.notes ?? null,
      };

      await toast.promise(recordWeighIn({ variables: { input: payload } }), {
        loading: "Registrando pesagem...",
        success: "Pesagem registrada com sucesso",
        error: (err: any) =>
          `Erro: ${err?.message ?? "falha ao registrar pesagem"}`,
      });

      reset();
    } catch (err) {
      console.error("Failed to record weigh-in", err);
      // toast já foi mostrado via toast.promise se erro ocorreu
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="text-sm block mb-1">Atleta</span>
          {athletesLoading && <div>Carregando atletas...</div>}
          {athletesError && (
            <div className="text-red-600">Erro carregando atletas</div>
          )}
          <select
            {...register("athleteId")}
            className="w-full p-2 border rounded bg-white"
            defaultValue=""
          >
            <option value="" disabled>
              -- selecione um atleta --
            </option>
            {athletesData?.athletes?.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.user?.name ?? a.user?.email}{" "}
                {a.defaultWeightKg ? `(${a.defaultWeightKg} kg)` : ""}
              </option>
            ))}
          </select>
          {errors.athleteId && (
            <div className="text-sm text-red-600 mt-1">
              {errors.athleteId.message}
            </div>
          )}
        </label>

        <label className="block">
          <span className="text-sm block mb-1">Peso (kg)</span>
          <input
            type="number"
            step="0.01"
            {...register("weightKg", { valueAsNumber: true })}
            className="w-full p-2 border rounded bg-white"
            placeholder="Ex.: 72.4"
          />
          {errors.weightKg && (
            <div className="text-sm text-red-600 mt-1">
              {errors.weightKg.message}
            </div>
          )}
        </label>

        <label className="block">
          <span className="text-sm block mb-1">Data/Hora (opcional)</span>
          <input
            type="datetime-local"
            {...register("recordedAt")}
            className="w-full p-2 border rounded bg-white"
          />
          {errors.recordedAt && (
            <div className="text-sm text-red-600 mt-1">
              {errors.recordedAt.message}
            </div>
          )}
        </label>

        <label className="block">
          <span className="text-sm block mb-1">Notas (opcional)</span>
          <input
            type="text"
            {...register("notes")}
            className="w-full p-2 border rounded bg-white"
            placeholder="Observações da pesagem"
          />
        </label>

        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar Pesagem"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecordWeighInForm;
