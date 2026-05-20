export interface Organisation {
  id: string;
  name: string;
  slug: string;
}

export type UserRole = 'admin' | 'engineer' | 'ops_staff';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organisation: Organisation | null;
}
