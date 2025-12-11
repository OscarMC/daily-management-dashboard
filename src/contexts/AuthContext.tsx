import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  theme: string;
  language: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3001';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      const response = await fetch(`${API_URL}/user`);
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      
      const users: (User & { password?: string })[] = await response.json();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      
      // For users without password, accept any password (legacy support)
      // For users with password, validate it
      if (foundUser.password && foundUser.password !== password) {
        return { success: false, error: 'Contraseña incorrecta' };
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error al iniciar sesión. Verifica que el servidor esté activo.' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user already exists
      const checkResponse = await fetch(`${API_URL}/user`);
      if (!checkResponse.ok) throw new Error('Error al conectar con el servidor');
      
      const users: User[] = await checkResponse.json();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        return { success: false, error: 'Ya existe un usuario con ese email' };
      }
      
      // Create new user
      const newUser = {
        name,
        email,
        password,
        role: 'User',
        theme: 'light',
        language: 'es'
      };
      
      const createResponse = await fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      if (!createResponse.ok) throw new Error('Error al crear usuario');
      
      const createdUser: User = await createResponse.json();
      const { password: _, ...userWithoutPassword } = createdUser as User & { password?: string };
      
      setUser(userWithoutPassword);
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Error al registrar. Verifica que el servidor esté activo.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
