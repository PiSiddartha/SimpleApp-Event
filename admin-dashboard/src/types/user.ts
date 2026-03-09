export interface CognitoUser {
  username: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  sub?: string;
  enabled?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  groups?: string[];
}

export interface ListUsersResponse {
  users: CognitoUser[];
  next_token?: string;
}

export interface CreateAdminUserInput {
  email: string;
  temp_password: string;
  given_name?: string;
  family_name?: string;
}

