// src/pages/AuthPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

// Imágenes de la web de WinSystems (extraídas de sus secciones)
const backgroundImages = [
  '../imgs/1.jpg',
  '../imgs/2.jpg',
  '../imgs/3.jpg',
  '../imgs/4.jpg',
  '../imgs/5.jpg',
  '../imgs/6.jpg',
  '../imgs/7.jpg',
  '../imgs/8.jpg',
  '../imgs/9.jpg',
  '../imgs/10.jpg',
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Carrusel automático (solo en desktop)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      setIsLoading(false);
      return;
    }

    // ✅ Validación: solo emails corporativos @winsysgroup.com
    const emailRegex = /^[^\s@]+@winsysgroup\.com$/;
    if (!emailRegex.test(email.trim())) {
      setError('El email debe ser corporativo (@winsysgroup.com)');
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Por favor, ingresa tu nombre');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }
      if (password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres');
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(name, email, password);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Error en la autenticación');
      }
    } catch {
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Carrusel de fondo */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {backgroundImages.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Formulario central */}
      <Card className="w-full max-w-md z-10 border border-gray-200 dark:border-gray-700 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          {/* Logo de WinSystems */}
          <div className="flex justify-center">
            <img
              src="https://winsysgroup.com/en/wp-content/themes/winsystem/images/logo-icon.svg"
              alt="WinSystems Logo"
              className="h-12 w-auto"
            />
          </div>

          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            {isLogin ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Accede a tu panel de gestión diaria'
              : 'Únete al equipo de WinSystems'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email corporativo
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@winsysgroup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#0056b3] hover:bg-[#004494] dark:bg-[#0056b3] dark:hover:bg-[#004494]"
              disabled={isLoading}
            >
              {isLoading
                ? 'Procesando...'
                : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#0056b3] hover:underline font-medium dark:text-[#6ec1e4]"
              disabled={isLoading}
            >
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}