// frontend/src/components/PromotionForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import {
  RECORD_PROMOTION,
  GET_PROMOTIONS,
  GET_ATHLETE,
} from "../graphql/queries";
import { Button, Input } from "../ui";
import { BELT_RANKS, BELT_RANK_LABELS } from "../domain/beltRanks";

type FormData = {
  rank: (typeof BELT_RANKS)[number];
  promotedAt: string;
  promotedBy?: string;
  notes?: string;
};

const schema: z.ZodType<FormData, any, any> = z.object({
  rank: z.enum(BELT_RANKS, { message: "Selecione a faixa" }),
  promotedAt: z.string().min(1, "Informe a data"),
  promotedBy: z.string().optional(),
  notes: z.string().optional(),
});

type Props = {
  athleteId: string;
  onSuccess: () => void;
  onCancel?: () => void;
};

export const PromotionForm: React.FC<Props> = ({
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
      rank: BELT_RANKS[0],
      promotedAt: "",
      promotedBy: "",
      notes: "",
    },
  });

  const [recordPromotion] = useMutation(RECORD_PROMOTION, {
    refetchQueries: [
      { query: GET_PROMOTIONS, variables: { athleteId } },
      { query: GET_ATHLETE, variables: { id: athleteId } },
    ],
  });

  const onSubmit = async (values: FormData) => {
    try {
      await toast.promise(
        recordPromotion({
          variables: {
            input: {
              athleteId,
              rank: values.rank,
              promotedAt: values.promotedAt,
              promotedBy: values.promotedBy || null,
              notes: values.notes || null,
            },
          },
        }),
        {
          loading: "Registrando graduação...",
          success: "Graduação registrada",
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
      <label className="block">
        <span className="text-sm block mb-1 text-text-muted">Faixa</span>
        <select
          {...register("rank")}
          className="w-full p-2 border rounded-lg bg-white"
        >
          {BELT_RANKS.map((rank) => (
            <option key={rank} value={rank}>
              {BELT_RANK_LABELS[rank]}
            </option>
          ))}
        </select>
        {errors.rank?.message && (
          <span className="text-sm text-danger-500 mt-1 block">
            {errors.rank.message}
          </span>
        )}
      </label>

      <Input
        label="Data da graduação"
        type="date"
        {...register("promotedAt")}
        error={errors.promotedAt?.message}
      />

      <Input
        label="Outorgada por (opcional)"
        placeholder="Ex: Sensei João"
        {...register("promotedBy")}
        error={errors.promotedBy?.message}
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
          {isSubmitting ? "Salvando..." : "Registrar graduação"}
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

export default PromotionForm;
