export interface CurrentUser {
  sub: string;
  email?: string;
  username?: string;
  groups: string[];
  role: 'admin' | 'student' | 'unknown';
}

