export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
}

export interface Organization {
  name: string;
  primary_color: string;
  secondary_color: string;
  theme_style: 'light' | 'dark';
}

export interface User {
  id: number;
  name: string;
  email: string;
  organization: Organization;
}

export interface AuthResponse {
  user: User;
  token: string;
}
