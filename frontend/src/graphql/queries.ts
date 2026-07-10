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
      heightCm
      defaultWeightKg
      coach {
        id
        user {
          id
          email
          name
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
      heightCm
      defaultWeightKg
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