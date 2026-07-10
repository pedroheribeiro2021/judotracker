// frontend/src/components/CreateCoachForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { CREATE_COACH, GET_COACHES } from "../graphql/queries";
import { Button, Input } from "../ui";

const schema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").optional(),
});

type FormData = z.infer<typeof schema>;

const CreateCoachForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", name: "" },
  });

  const [createCoach] = useMutation(CREATE_COACH, {
    refetchQueries: [{ query: GET_COACHES }],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: FormData) => {
    try {
      await toast.promise(
        createCoach({ variables: { input: { email: values.email, name: values.name ?? null } } }),
        {
          loading: "Criando treinador...",
          success: "Treinador criado",
          error: (e: any) => `Erro: ${e?.message ?? "falha"}`,
        }
      );
      reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Nome"
        {...register("name")}
        error={errors.name?.message}
      />
      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Treinador"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCoachForm;
