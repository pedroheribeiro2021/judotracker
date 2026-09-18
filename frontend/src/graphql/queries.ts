// frontend/src/graphql/queries.ts
import { gql } from "@apollo/client";

export const GET_ATHLETES = gql`
  query GetAthletes {
    athletes {
      id
      user {
        id
        email
        name
      }
      dob
      sex
      heightCm
      defaultWeightKg
      ageDivision
      currentWeightClass
      lastWeighInKg
      currentBelt
      coach {
        id
        user {
          id
          email
          name
        }
      }
      entries {
        id
        weightClass
        competition {
          id
          date
        }
      }
    }
  }
`;

export const GET_ATHLETE = gql`
  query GetAthlete($id: ID!) {
    athlete(id: $id) {
      id
      dob
      sex
      heightCm
      defaultWeightKg
      ageDivision
      currentWeightClass
      lastWeighInKg
      currentBelt
      user {
        id
        email
        name
      }
      coach {
        id
        user {
          id
          name
          email
        }
      }
      createdAt
      entries {
        id
        weightClass
        result
        rank
        finalPosition
        medal
        competition {
          id
          name
          date
          location
          level
        }
      }
    }
  }
`;

export const GET_WEIGHINS = gql`
  query GetWeighIns($athleteId: ID!) {
    weighIns(athleteId: $athleteId) {
      id
      weightKg
      recordedAt
      notes
    }
  }
`;

export const GET_COACHES = gql`
  query GetCoaches {
    coaches {
      id
      user {
        id
        email
        name
      }
      athletes {
        id
      }
    }
  }
`;

export const CREATE_ATHLETE = gql`
  mutation CreateAthlete($input: CreateAthleteInput!) {
    createAthlete(input: $input) {
      id
      user {
        id
        email
        name
      }
      dob
      sex
      heightCm
      defaultWeightKg
      coach {
        id
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const CREATE_COACH = gql`
  mutation CreateCoach($input: CreateCoachInput!) {
    createCoach(input: $input) {
      id
      user {
        id
        email
        name
      }
    }
  }
`;

export const RECORD_WEIGHIN = gql`
  mutation RecordWeighIn($input: RecordWeighInInput!) {
    recordWeighIn(input: $input) {
      id
      athleteId
      weightKg
      recordedAt
    }
  }
`;

export const UPDATE_ATHLETE = gql`
  mutation UpdateAthlete($input: UpdateAthleteInput!) {
    updateAthlete(input: $input) {
      id
      heightCm
      defaultWeightKg
      coach {
        id
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const DELETE_ATHLETE = gql`
  mutation DeleteAthlete($id: ID!) {
    deleteAthlete(id: $id)
  }
`;

export const GET_COMPETITIONS = gql`
  query GetCompetitions($upcoming: Boolean, $past: Boolean) {
    competitions(upcoming: $upcoming, past: $past) {
      id
      name
      date
      location
      level
      federation
      city
      state
      registrationDeadline
      notes
      entries {
        id
        athleteId
        weightClass
        result
        rank
        finalPosition
        medal
        athlete {
          id
          defaultWeightKg
          lastWeighInKg
          user {
            id
            name
            email
          }
        }
      }
    }
  }
`;

export const CREATE_COMPETITION = gql`
  mutation CreateCompetition($input: CreateCompetitionInput!) {
    createCompetition(input: $input) {
      id
      name
      date
      location
      level
      federation
      city
      state
      registrationDeadline
      notes
    }
  }
`;

export const UPDATE_COMPETITION = gql`
  mutation UpdateCompetition($input: UpdateCompetitionInput!) {
    updateCompetition(input: $input) {
      id
      name
      date
      location
      level
      federation
      city
      state
      registrationDeadline
      notes
    }
  }
`;

export const DELETE_COMPETITION = gql`
  mutation DeleteCompetition($id: ID!) {
    deleteCompetition(id: $id)
  }
`;

export const REGISTER_ENTRY = gql`
  mutation RegisterEntry(
    $competitionId: ID!
    $athleteId: ID!
    $weightClass: String
  ) {
    registerEntry(
      competitionId: $competitionId
      athleteId: $athleteId
      weightClass: $weightClass
    ) {
      id
      athleteId
      weightClass
      athlete {
        id
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const REMOVE_ENTRY = gql`
  mutation RemoveEntry($id: ID!) {
    removeEntry(id: $id)
  }
`;

export const GET_MATCHES = gql`
  query GetMatches($entryId: ID!) {
    matches(entryId: $entryId) {
      id
      entryId
      round
      opponentName
      opponentClub
      result
      scoreType
      technique
      shidosFor
      shidosAgainst
      goldenScore
      durationSeconds
      notes
    }
  }
`;

export const RECORD_MATCH = gql`
  mutation RecordMatch($input: RecordMatchInput!) {
    recordMatch(input: $input) {
      id
      entryId
      round
      opponentName
      opponentClub
      result
      scoreType
      technique
      shidosFor
      shidosAgainst
      goldenScore
      durationSeconds
      notes
    }
  }
`;

export const UPDATE_MATCH = gql`
  mutation UpdateMatch($input: UpdateMatchInput!) {
    updateMatch(input: $input) {
      id
      entryId
      round
      opponentName
      opponentClub
      result
      scoreType
      technique
      shidosFor
      shidosAgainst
      goldenScore
      durationSeconds
      notes
    }
  }
`;

export const DELETE_MATCH = gql`
  mutation DeleteMatch($id: ID!) {
    deleteMatch(id: $id)
  }
`;

export const SET_ENTRY_RESULT = gql`
  mutation SetEntryResult($entryId: ID!, $finalPosition: Int, $medal: Medal) {
    setEntryResult(
      entryId: $entryId
      finalPosition: $finalPosition
      medal: $medal
    ) {
      id
      finalPosition
      medal
    }
  }
`;

export const GET_PROMOTIONS = gql`
  query GetPromotions($athleteId: ID!) {
    promotions(athleteId: $athleteId) {
      id
      athleteId
      rank
      promotedAt
      promotedBy
      notes
    }
  }
`;

export const RECORD_PROMOTION = gql`
  mutation RecordPromotion($input: RecordPromotionInput!) {
    recordPromotion(input: $input) {
      id
      athleteId
      rank
      promotedAt
      promotedBy
      notes
    }
  }
`;

export const DELETE_PROMOTION = gql`
  mutation DeletePromotion($id: ID!) {
    deletePromotion(id: $id)
  }
`;