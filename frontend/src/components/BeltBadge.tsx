// frontend/src/components/BeltBadge.tsx
import React from "react";
import { BELT_RANK_COLORS, BELT_RANK_LABELS, BeltRank } from "../domain/beltRanks";

type Props = {
  rank?: BeltRank | string | null;
  className?: string;
};

export const BeltBadge: React.FC<Props> = ({ rank, className }) => {
  if (!rank || !(rank in BELT_RANK_COLORS)) return null;
  const key = rank as BeltRank;
  const spec = BELT_RANK_COLORS[key];
  const background =
    spec.colors.length === 2
      ? `linear-gradient(90deg, ${spec.colors[0]} 50%, ${spec.colors[1]} 50%)`
      : spec.colors[0];

  return (
    <span
      className={`inline-block text-xs px-2 py-0.5 rounded-full border border-black/10 whitespace-nowrap ${className ?? ""}`}
      style={{ background, color: spec.text }}
      title={BELT_RANK_LABELS[key]}
    >
      {BELT_RANK_LABELS[key]}
    </span>
  );
};

export default BeltBadge;
