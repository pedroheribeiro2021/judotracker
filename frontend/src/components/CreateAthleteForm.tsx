// frontend/src/components/CreateAthleteForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { CREATE_ATHLETE, GET_ATHLETES, GET_COACHES } from "../graphql/queries";
import { Button } from "../ui";
import { Input } from "../ui";

type FormData = {
  email: string;
  name?: string;
  dob?: string;
  heightCm?: number | null;
  defaultWeightKg?: number | null;
  coachId?: string | null;
};

// schema keeps dob as optional string (we'll parse it manually)
const schema: z.ZodType<FormData, any, any> = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  dob: z.string().optional(), // we'll accept 'DD/MM/YYYY' or empty
  heightCm: z
    .any()
    .optional()
    .transform((v) => {
      if (v == null) return undefined;
      if (typeof v === "number" && Number.isNaN(v)) return undefined;
      const n = typeof v === "string" ? Number(v) : v;
      if (typeof n !== "number" || Number.isNaN(n)) return undefined;
      if (n <= 0) return undefined;
      return n;
    }),
  defaultWeightKg: z
    .any()
    .optional()
    .transform((v) => {
      if (v == null) return undefined;
      if (typeof v === "number" && Number.isNaN(v)) return undefined;
      const n = typeof v === "string" ? Number(v) : v;
      if (typeof n !== "number" || Number.isNaN(n)) return undefined;
      if (n <= 0) return undefined;
      return n;
    }),
  coachId: z
    .any()
    .optional()
    .transform((v) => {
      if (v == null) return undefined;
      if (typeof v !== "string") return undefined;
      const trimmed = v.trim();
      if (!trimmed) return null;
      return trimmed;
    })
    .refine((v) => v == null || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v), {
      message: "Treinador inválido.",
    }),
});

/** parse date in DD/MM/YYYY -> returns ISO 'YYYY-MM-DD' or null if invalid */
function parseDateBRtoISO(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Accept separators / or - or .
  const parts = trimmed.split(/[\/\-\.\s]+/);
  if (parts.length !== 3) return null;
  const [dd, mm, yy] = parts;
  // handle two-digit years? assume 4-digit year required
  if (!/^\d{2}$/.test(dd) && !/^\d{1,2}$/.test(dd)) return null;
  if (!/^\d{2}$/.test(mm) && !/^\d{1,2}$/.test(mm)) return null;
  if (!/^\d{4}$/.test(yy)) return null;

  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yy);

  // basic validation
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // create Date and validate
  const isoString = `${year.toString().padStart(4, "0")}-${String(
    month
  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const d = new Date(isoString + "T00:00:00Z"); // set UTC midnight to avoid timezone shifts
  if (isNaN(d.getTime())) return null;

  // ensure it matches (avoid 31/02 rolling)
  if (
    d.getUTCDate() !== day ||
    d.getUTCMonth() + 1 !== month ||
    d.getUTCFullYear() !== year
  )
    return null;

  return isoString; // YYYY-MM-DD
}

const CreateAthleteForm: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
      dob: "",
      heightCm: undefined,
      defaultWeightKg: undefined,
      coachId: undefined,
    },
  });

  const { data: coachesData } = useQuery(GET_COACHES);

  const [createAthlete] = useMutation(CREATE_ATHLETE, {
    refetchQueries: [{ query: GET_ATHLETES }],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: FormData) => {
    try {
      // parse dob (DD/MM/YYYY) to ISO or null
      let dobIso: string | null = null;
      if (values.dob) {
        dobIso = parseDateBRtoISO(values.dob);
        if (!dobIso) {
          toast.error("Data de nascimento inválida. Use o formato DD/MM/YYYY.");
          return;
        }
      }

      const payload: any = {
        email: values.email,
        name: values.name ?? null,
        dob: dobIso, // ISO string or null
        heightCm: values.heightCm ?? null,
        defaultWeightKg: values.defaultWeightKg ?? null,
        coachId: values.coachId ?? null,
      };

      await toast.promise(createAthlete({ variables: { input: payload } }), {
        loading: "Criando atleta...",
        success: "Atleta criado",
        error: (e: any) => `Erro: ${e?.message ?? "falha"}`,
      });

      reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar atleta.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        {...register("email")}
        error={errors.email?.message as string | undefined}
      />
      <Input
        label="Nome"
        {...register("name")}
        error={errors.name?.message as string | undefined}
      />

      {/* DOB: text input expecting DD/MM/YYYY (label no longer shows format) */}
      <Input
        label="Data de Nascimento"
        placeholder="DD/MM/YYYY"
        {...register("dob")}
        error={errors.dob?.message as string | undefined}
      />

      <Input
        label="Altura (cm)"
        type="number"
        {...register("heightCm", { valueAsNumber: true })}
        error={errors.heightCm?.message as string | undefined}
      />

      <Input
        label="Peso padrão (kg)"
        type="number"
        {...register("defaultWeightKg", { valueAsNumber: true })}
        error={errors.defaultWeightKg?.message as string | undefined}
      />

      <label className="block">
        <span className="text-sm block mb-1">Treinador (opcional)</span>
        <select
          {...register("coachId")}
          className="w-full p-2 border rounded bg-white"
        >
          <option value="">Sem Treinador</option>
          {coachesData?.coaches?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.user?.name ?? c.user?.email}
            </option>
          ))}
        </select>
        {errors.coachId?.message && (
          <span className="text-sm text-red-600 mt-1 block">
            {errors.coachId.message as string}
          </span>
        )}
      </label>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Atleta"}
        </Button>
      </div>
    </form>
  );
};

export default CreateAthleteForm;
