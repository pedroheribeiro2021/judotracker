// frontend/src/components/MatchForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import {
  RECORD_MATCH,
  UPDATE_MATCH,
  GET_MATCHES,
} from "../graphql/queries";
import { Button, Input } from "../ui";
import {
  MATCH_ROUNDS,
  MATCH_RESULTS,
  MATCH_RESULT_LABELS,
  SCORE_TYPES,
  SCORE_TYPE_LABELS,
} from "../domain/matchEnums";

type FormData = {
  round: (typeof MATCH_ROUNDS)[number];
  opponentName: string;
  opponentClub?: string;
  result: (typeof MATCH_RESULTS)[number];
  scoreType?: (typeof SCORE_TYPES)[number] | "";
  technique?: string;
  shidosFor: number;
  shidosAgainst: number;
  goldenScore: boolean;
  durationSeconds?: number;
  notes?: string;
};

const schema: z.ZodType<FormData, any, any> = z.object({
  round: z.enum(MATCH_ROUNDS, { message: "Selecione a fase" }),
  opponentName: z.string().min(2, "Informe o nome do adversário"),
  opponentClub: z.string().optional(),
  result: z.enum(MATCH_RESULTS, { message: "Selecione o resultado" }),
  scoreType: z.union([z.enum(SCORE_TYPES), z.literal("")]).optional(),
  technique: z.string().optional(),
  shidosFor: z.coerce.number().int().min(0),
  shidosAgainst: z.coerce.number().int().min(0),
  goldenScore: z.boolean(),
  durationSeconds: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(0).optional(),
  ),
  notes: z.string().optional(),
});

type Props = {
  entryId: string;
  match?: any;
  onSuccess: () => void;
  onCancel?: () => void;
};

export const MatchForm: React.FC<Props> = ({
  entryId,
  match,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(match);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      round: match?.round ?? MATCH_ROUNDS[0],
      opponentName: match?.opponentName ?? "",
      opponentClub: match?.opponentClub ?? "",
      result: match?.result ?? "WIN",
      scoreType: match?.scoreType ?? "",
      technique: match?.technique ?? "",
      shidosFor: match?.shidosFor ?? 0,
      shidosAgainst: match?.shidosAgainst ?? 0,
      goldenScore: match?.goldenScore ?? false,
      durationSeconds: match?.durationSeconds ?? undefined,
      notes: match?.notes ?? "",
    },
  });

  const [recordMatch] = useMutation(RECORD_MATCH, {
    refetchQueries: [{ query: GET_MATCHES, variables: { entryId } }],
  });
  const [updateMatch] = useMutation(UPDATE_MATCH, {
    refetchQueries: [{ query: GET_MATCHES, variables: { entryId } }],
  });

  const onSubmit = async (values: FormData) => {
    try {
      const basePayload = {
        round: values.round,
        opponentName: values.opponentName,
        opponentClub: values.opponentClub || null,
        result: values.result,
        scoreType: values.scoreType || null,
        technique: values.technique || null,
        shidosFor: values.shidosFor,
        shidosAgainst: values.shidosAgainst,
        goldenScore: values.goldenScore,
        durationSeconds:
          values.durationSeconds == null || Number.isNaN(values.durationSeconds)
            ? null
            : values.durationSeconds,
        notes: values.notes || null,
      };

      if (isEditing) {
        await toast.promise(
          updateMatch({ variables: { input: { id: match.id, ...basePayload } } }),
          {
            loading: "Salvando luta...",
            success: "Luta atualizada",
            error: (e: any) => `Erro: ${e?.message ?? "falha"}`,
          },
        );
      } else {
        await toast.promise(
          recordMatch({ variables: { input: { entryId, ...basePayload } } }),
          {
            loading: "Registrando luta...",
            success: "Luta registrada",
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
      <label className="block">
        <span className="text-sm block mb-1 text-text-muted">Fase</span>
        <select
          {...register("round")}
          className="w-full p-2 border rounded-lg bg-white"
        >
          {MATCH_ROUNDS.map((round) => (
            <option key={round} value={round}>
              {round}
            </option>
          ))}
        </select>
        {errors.round?.message && (
          <span className="text-sm text-danger-500 mt-1 block">
            {errors.round.message}
          </span>
        )}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Adversário"
          {...register("opponentName")}
          error={errors.opponentName?.message}
        />
        <Input
          label="Clube do adversário (opcional)"
          {...register("opponentClub")}
          error={errors.opponentClub?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm block mb-1 text-text-muted">Resultado</span>
          <select
            {...register("result")}
            className="w-full p-2 border rounded-lg bg-white"
          >
            {MATCH_RESULTS.map((result) => (
              <option key={result} value={result}>
                {MATCH_RESULT_LABELS[result]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm block mb-1 text-text-muted">
            Forma de pontuação (opcional)
          </span>
          <select
            {...register("scoreType")}
            className="w-full p-2 border rounded-lg bg-white"
          >
            <option value="">-</option>
            {SCORE_TYPES.map((scoreType) => (
              <option key={scoreType} value={scoreType}>
                {SCORE_TYPE_LABELS[scoreType]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Input
        label="Técnica (opcional)"
        placeholder="Ex: seoi-nage, o-soto-gari"
        {...register("technique")}
        error={errors.technique?.message}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Shidos a favor"
          type="number"
          min={0}
          {...register("shidosFor")}
          error={errors.shidosFor?.message}
        />
        <Input
          label="Shidos contra"
          type="number"
          min={0}
          {...register("shidosAgainst")}
          error={errors.shidosAgainst?.message}
        />
        <Input
          label="Duração (segundos, opcional)"
          type="number"
          min={0}
          {...register("durationSeconds")}
          error={errors.durationSeconds?.message}
        />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register("goldenScore")} />
        <span className="text-sm text-text-muted">Golden score</span>
      </label>

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
              : "Registrar luta"}
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

export default MatchForm;
