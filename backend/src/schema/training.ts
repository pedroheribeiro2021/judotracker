// backend/src/schema/training.ts
import { gql } from "apollo-server";

export const trainingTypeDefs = gql`
  enum TrainingType {
    TECHNICAL
    RANDORI
    PHYSICAL
    KATA
    COMPETITION_PREP
  }

  type Attendance {
    id: ID!
    sessionId: ID!
    athleteId: ID!
    athlete: Athlete
    present: Boolean!
  }

  type TrainingSession {
    id: ID!
    date: String!
    type: TrainingType!
    durationMinutes: Int!
    coachId: ID
    coach: Coach
    notes: String
    attendances: [Attendance!]!
  }

  type AttendanceStats {
    """Percentual de presença nos últimos 30 dias, de 0 a 100."""
    rate30: Float!
    """Percentual de presença nos últimos 90 dias, de 0 a 100."""
    rate90: Float!
    """Sequência atual de sessões consecutivas (mais recentes) com presença."""
    currentStreak: Int!
    """Sessões registradas nos últimos 30 dias (denominador de rate30)."""
    sessions30: Int!
    """Sessões registradas nos últimos 90 dias (denominador de rate90)."""
    sessions90: Int!
  }

  extend type Athlete {
    attendanceStats: AttendanceStats!
  }

  input CreateTrainingSessionInput {
    date: String!
    type: TrainingType!
    durationMinutes: Int!
    notes: String
  }

  extend type Query {
    trainingSessions(from: String, to: String): [TrainingSession!]!
  }

  extend type Mutation {
    createTrainingSession(input: CreateTrainingSessionInput!): TrainingSession!
    deleteTrainingSession(id: ID!): Boolean!
    """Substitui a lista de presentes da sessão pelos atletas informados."""
    setAttendance(sessionId: ID!, athleteIds: [ID!]!): [Attendance!]!
  }
`;
