// frontend/src/components/CompetitionForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { CREATE_COMPETITION, UPDATE_COMPETITION } from "../graphql/queries";
import { Button, Input } from "../ui";
import {
  COMPETITION_LEVELS,
  COMPETITION_LEVEL_LABELS,
} from "../domain/competitionLevels";

type FormData = {
  name: string;
  date: string;
  location?: string;
  level: (typeof COMPETITION_LEVELS)[number];
  federation?: string;
  city?: string;
  state?: string;
  registrationDeadline?: string;
  notes?: string;
};

const schema: z.ZodType<FormData, any, any> = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  date: z.string().min(1, "Informe a data"),
  location: z.string().optional(),
  level: z.enum(COMPETITION_LEVELS, { message: "Selecione o nível" }),
  federation: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  registrationDeadline: z.string().optional(),
  notes: z.string().optional(),
});

/** Converte 'YYYY-MM-DDTHH:mm:ss.sssZ' (ou similar) para 'YYYY-MM-DD' usado por <input type="date"> */
function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

type Props = {
  competition?: any;
  onSuccess: () => void;
  onCancel?: () => void;
};

export const CompetitionForm: React.FC<Props> = ({
  competition,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(competition);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: competition?.name ?? "",
      date: toDateInputValue(competition?.date),
      location: competition?.location ?? "",
      level: competition?.level ?? "REGIONAL",
      federation: competition?.federation ?? "",
      city: competition?.city ?? "",
      state: competition?.state ?? "",
      registrationDeadline: toDateInputValue(
        competition?.registrationDeadline,
      ),
      notes: competition?.notes ?? "",
    },
  });

  const [createCompetition] = useMutation(CREATE_COMPETITION);
  const [updateCompetition] = useMutation(UPDATE_COMPETITION);

  const onSubmit = async (values: FormData) => {
    try {
      const basePayload = {
        name: values.name,
        date: values.date,
        location: values.location || null,
        level: values.level,
        federation: values.federation || null,
        city: values.city || null,
        state: values.state || null,
        registrationDeadline: values.registrationDeadline || null,
        notes: values.notes || null,
      };

      if (isEditing) {
        await toast.promise(
          updateCompetition({
            variables: { input: { id: competition.id, ...basePayload } },
          }),
          {
            loading: "Salvando competição...",
            success: "Competição atualizada",
            error: (e: any) => `Erro: ${e?.message ?? "falha"}`,
          },
        );
      } else {
        await toast.promise(
          createCompetition({ variables: { input: basePayload } }),
          {
            loading: "Criando competição...",
            success: "Competição criada",
            error: (e: any) => `Erro: ${e?.message ?? "falha"}`,
          },
        );
      }

      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome"
        {...register("name")}
        error={errors.name?.message}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data"
          type="date"
          {...register("date")}
          error={errors.date?.message}
        />
        <Input
          label="Prazo de inscrição (opcional)"
          type="date"
          {...register("registrationDeadline")}
          error={errors.registrationDeadline?.message}
        />
      </div>

      <label className="block">
        <span className="text-sm block mb-1 text-text-muted">Nível</span>
        <select
          {...register("level")}
          className="w-full p-2 border rounded-lg bg-white"
        >
          {COMPETITION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {COMPETITION_LEVEL_LABELS[level]}
            </option>
          ))}
        </select>
        {errors.level?.message && (
          <span className="text-sm text-danger-500 mt-1 block">
            {errors.level.message}
          </span>
        )}
      </label>

      <Input
        label="Federação (opcional)"
        placeholder="Ex: FPJ, CBJ, IJF"
        {...register("federation")}
        error={errors.federation?.message}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Cidade (opcional)"
          {...register("city")}
          error={errors.city?.message}
        />
        <Input
          label="Estado (opcional)"
          {...register("state")}
          error={errors.state?.message}
        />
      </div>

      <Input
        label="Local (opcional)"
        {...register("location")}
        error={errors.location?.message}
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
          {isSubmitting
            ? "Salvando..."
            : isEditing
              ? "Salvar"
              : "Criar Competição"}
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

export default CompetitionForm;
