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
  access_role?: 'admin' | 'student';
  user_type?: 'student' | 'professional' | null;
  university?: string | null;
  course?: string | null;
  year_of_study?: string | null;
  city?: string | null;
  state?: string | null;
  designation?: string | null;
  company?: string | null;
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
