// backend/src/schema/promotion.ts
import { gql } from "apollo-server";

export const promotionTypeDefs = gql`
  enum BeltRank {
    WHITE
    WHITE_GREY
    GREY
    GREY_BLUE
    BLUE
    BLUE_YELLOW
    YELLOW
    YELLOW_ORANGE
    ORANGE
    GREEN
    PURPLE
    BROWN
    BLACK_1DAN
    BLACK_2DAN
    BLACK_3DAN
    BLACK_4DAN
    BLACK_5DAN
    RED_WHITE_6DAN
    RED_WHITE_7DAN
    RED_WHITE_8DAN
    RED_9DAN
    RED_10DAN
  }

  type Promotion {
    id: ID!
    athleteId: ID!
    athlete: Athlete
    rank: BeltRank!
    promotedAt: String!
    promotedBy: String
    notes: String
  }

  extend type Athlete {
    """Faixa atual do atleta (graduação da promoção mais recente)."""
    currentBelt: BeltRank
  }

  input RecordPromotionInput {
    athleteId: ID!
    rank: BeltRank!
    promotedAt: String!
    promotedBy: String
    notes: String
  }

  extend type Query {
    promotions(athleteId: ID!): [Promotion!]!
  }

  extend type Mutation {
    recordPromotion(input: RecordPromotionInput!): Promotion!
    deletePromotion(id: ID!): Boolean!
  }
`;
