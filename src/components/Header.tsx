import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from './LanguageSelector'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Shield, User } from 'lucide-react';

export default function Header() {
 const { t } = useTranslation()
 const { user, logout } = useAuth()
 const navigate = useNavigate()

 const handleLogout = () => {
  logout()
  navigate('/auth')
 }

 return (
  <header className="relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
   {/* Izquierda: info usuario */}
   <div className="flex items-center gap-2 text-sm text-muted-foreground">
    {user && user.role === 'Admin' && <Shield
     size={16}
     className='text-red-500'
    />}
    {user && user.role !== 'Admin' && <User
     size={16}
     className='text-blue-500'
    />}
    {user && <span>{user.role}</span>}
   </div>

   {/* Título centrado absolutamente en el centro del header */}
   <h1 className="text-2xl font-semibold absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
    {t('app.title')}
   </h1>

   {/* Derecha: controles reales */}
   <div className="flex items-center gap-4">
    <LanguageSelector />
    <ThemeToggle />
    <Button variant="ghost" size="sm" onClick={handleLogout} title="Cerrar sesión">
     <LogOut className="h-4 w-4" />
    </Button>
   </div>
  </header>
 )
}
