export interface User {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
  createdAt: string
  plan: 'free' | 'pro' | 'enterprise'
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string
  confirmPassword: string
}
