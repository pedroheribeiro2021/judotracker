// frontend/src/components/TrainingSessionForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { CREATE_TRAINING_SESSION } from "../graphql/queries";
import { Button, Input } from "../ui";
import { TRAINING_TYPES, TRAINING_TYPE_LABELS } from "../domain/trainingTypes";

type FormData = {
  date: string;
  type: (typeof TRAINING_TYPES)[number];
  durationMinutes: number;
  notes?: string;
};

const schema: z.ZodType<FormData, any, any> = z.object({
  date: z.string().min(1, "Informe a data e hora"),
  type: z.enum(TRAINING_TYPES, { message: "Selecione o tipo" }),
  durationMinutes: z.coerce.number().int().min(1, "Informe a duração"),
  notes: z.string().optional(),
});

type Props = {
  defaultDate?: string;
  onSuccess: () => void;
  onCancel?: () => void;
};

export const TrainingSessionForm: React.FC<Props> = ({
  defaultDate,
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate ?? "",
      type: TRAINING_TYPES[0],
      durationMinutes: 90,
      notes: "",
    },
  });

  const [createTrainingSession] = useMutation(CREATE_TRAINING_SESSION);

  const onSubmit = async (values: FormData) => {
    try {
      await toast.promise(
        createTrainingSession({
          variables: {
            input: {
              date: new Date(values.date).toISOString(),
              type: values.type,
              durationMinutes: values.durationMinutes,
              notes: values.notes || null,
            },
          },
        }),
        {
          loading: "Criando sessão...",
          success: "Sessão de treino criada",
          error: (e: any) => `Erro: ${e?.message ?? "falha"}`,
        },
      );

      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Data e hora"
        type="datetime-local"
        {...register("date")}
        error={errors.date?.message}
      />

      <label className="block">
        <span className="text-sm block mb-1 text-text-muted">Tipo</span>
        <select
          {...register("type")}
          className="w-full p-2 border rounded-lg bg-white"
        >
          {TRAINING_TYPES.map((type) => (
            <option key={type} value={type}>
              {TRAINING_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {errors.type?.message && (
          <span className="text-sm text-danger-500 mt-1 block">
            {errors.type.message}
          </span>
        )}
      </label>

      <Input
        label="Duração (minutos)"
        type="number"
        min={1}
        {...register("durationMinutes")}
        error={errors.durationMinutes?.message}
      />

      <label className="block">
        <span className="text-sm block mb-1 text-text-muted">
          Notas (opcional)
        </span>
        <textarea
          {...register("notes")}
          className="w-full p-2 border rounded-lg bg-white"
          rows={3}
        />
      </label>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Criar sessão"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};

export default TrainingSessionForm;
