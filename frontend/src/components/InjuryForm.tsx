// frontend/src/components/InjuryForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { RECORD_INJURY, GET_INJURIES, GET_ATHLETE } from "../graphql/queries";
import { Button, Input } from "../ui";
import { INJURY_SEVERITIES, INJURY_SEVERITY_LABELS } from "../domain/injuries";

type FormData = {
  bodyPart: string;
  description: string;
  occurredAt: string;
  expectedReturn?: string;
  severity: (typeof INJURY_SEVERITIES)[number];
  notes?: string;
};

const schema: z.ZodType<FormData, any, any> = z.object({
  bodyPart: z.string().min(2, "Informe a região afetada"),
  description: z.string().min(3, "Descreva a lesão"),
  occurredAt: z.string().min(1, "Informe a data"),
  expectedReturn: z.string().optional(),
  severity: z.enum(INJURY_SEVERITIES, { message: "Selecione a gravidade" }),
  notes: z.string().optional(),
});

type Props = {
  athleteId: string;
  onSuccess: () => void;
  onCancel?: () => void;
};

export const InjuryForm: React.FC<Props> = ({
  athleteId,
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
      bodyPart: "",
      description: "",
      occurredAt: "",
      expectedReturn: "",
      severity: "MINOR",
      notes: "",
    },
  });

  const [recordInjury] = useMutation(RECORD_INJURY, {
    refetchQueries: [
      { query: GET_INJURIES, variables: { athleteId } },
      { query: GET_ATHLETE, variables: { id: athleteId } },
    ],
  });

  const onSubmit = async (values: FormData) => {
    try {
      await toast.promise(
        recordInjury({
          variables: {
            input: {
              athleteId,
              bodyPart: values.bodyPart,
              description: values.description,
              occurredAt: values.occurredAt,
              expectedReturn: values.expectedReturn || null,
              severity: values.severity,
              notes: values.notes || null,
            },
          },
        }),
        {
          loading: "Registrando lesão...",
          success: "Lesão registrada",
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
        label="Região afetada"
        placeholder="Ex: Joelho direito"
        {...register("bodyPart")}
        error={errors.bodyPart?.message}
      />

      <label className="block">
        <span className="text-sm block mb-1 text-text-muted">Descrição</span>
        <textarea
          {...register("description")}
          className="w-full p-2 border rounded-lg bg-white"
          rows={2}
        />
        {errors.description?.message && (
          <span className="text-sm text-danger-500 mt-1 block">
            {errors.description.message}
          </span>
        )}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data da lesão"
          type="date"
          {...register("occurredAt")}
          error={errors.occurredAt?.message}
        />
        <Input
          label="Retorno previsto (opcional)"
          type="date"
          {...register("expectedReturn")}
          error={errors.expectedReturn?.message}
        />
      </div>

      <label className="block">
        <span className="text-sm block mb-1 text-text-muted">Gravidade</span>
        <select
          {...register("severity")}
          className="w-full p-2 border rounded-lg bg-white"
        >
          {INJURY_SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {INJURY_SEVERITY_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm block mb-1 text-text-muted">
          Notas (opcional)
        </span>
        <textarea
          {...register("notes")}
          className="w-full p-2 border rounded-lg bg-white"
          rows={2}
        />
      </label>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Registrar lesão"}
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

export default InjuryForm;
