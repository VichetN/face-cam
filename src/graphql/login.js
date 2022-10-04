import { gql } from "@apollo/client";

export const GET_USERLOGIN = gql`
query GetUserLogin {
  getUserLogin {
    _id
    first_name
    last_name
    role
    email
    created_at
    image {
      src
      name
    }
  }
}
`;