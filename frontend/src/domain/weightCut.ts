// frontend/src/domain/weightCut.ts

/**
 * Excedente em kg do último peso registrado sobre o teto da categoria
 * (ex.: "-73" tem teto 73kg). Categorias abertas ("+100") não têm teto,
 * então nunca geram alerta. O parse é feito a partir do próprio texto da
 * categoria (não da tabela oficial), já que o treinador pode sobrescrevê-la
 * manualmente na inscrição.
 */
export function getWeightCutExcessKg(
  weightClass?: string | null,
  lastWeighInKg?: number | null,
): number | null {
  if (!weightClass || lastWeighInKg == null) return null;
  if (!weightClass.startsWith("-")) return null;
  const limit = Number(weightClass.slice(1).replace(",", "."));
  if (Number.isNaN(limit)) return null;
  const excess = lastWeighInKg - limit;
  return excess > 0 ? excess : null;
}

export function formatWeightCutMessage(
  excessKg: number,
  weightClass: string,
): string {
  const formatted = excessKg.toFixed(1).replace(".", ",");
  return `+${formatted} kg acima de ${weightClass}`;
}
