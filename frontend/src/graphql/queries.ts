import { gql } from '@apollo/client';

export const GET_ATHLETES = gql`
query GetAthletes {
  athletes {
    id
    user {
      email
      name
    }
    heightCm
    defaultWeightKg
  }
}
`;
