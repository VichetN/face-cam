import { gql } from "@apollo/client";

export const GET_BRANCH_BYID = gql`
    query GetBranchById($id: ID!) {
        getBranchById(_id: $id) {
            _id
            branch_name
            description
            longitude
            latitude
            created_at
        }
    }
`