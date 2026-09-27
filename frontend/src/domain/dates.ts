// frontend/src/domain/dates.ts
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Datas "só dia" (nascimento, data da prova, prazo de inscrição, graduação,
 * lesão) chegam do backend como meia-noite UTC. Interpretadas no fuso do
 * navegador (UTC−3 no Brasil) elas viravam o dia anterior — 02/11 aparecia
 * como 01/11. Aqui a data é reconstruída a partir dos componentes UTC, então
 * o dia exibido é sempre o dia gravado.
 *
 * Não use para campos com horário (pesagens, treinos): esses são instantes
 * reais e devem ser mostrados no fuso local.
 */
export function toDateOnly(value?: string | number | Date | null): Date | null {
  if (value == null || value === "") return null;
  const d =
    value instanceof Date
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? new Date(Number(value))
        : new Date(value);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function formatDateOnly(
  value?: string | number | Date | null,
  pattern = "dd/MM/yyyy",
): string {
  const d = toDateOnly(value);
  return d ? format(d, pattern, { locale: ptBR }) : "-";
}

/** Número com vírgula decimal (pt-BR): 33.3 → "33,3". */
export function formatDecimal(value: number, maxFractionDigits = 1): string {
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: maxFractionDigits,
  });
}
