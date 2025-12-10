import { useState } from 'react'
import {
  Home,
  ClipboardList,
  CalendarCheck,
  Clock,
  FolderGit2,
  GitBranch,
  Bird,
  ChevronRight,
  ChevronDown,
  User,
  Wrench,
  Caravan,
  LayoutDashboard
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexieDB'

const mainMenu = [
  { path: '/', label: 'dashboard', icon: Home },
  { path: '/daily-tasks', label: 'dailyTasks', icon: ClipboardList },
  { path: '/overview', label: 'overview', icon: CalendarCheck },
  { path: '/working-day-summary', label: 'workingDay', icon: Clock }
]

const configMenu = [
  { path: '/repositories', label: 'repositories', icon: FolderGit2, fontColor: 'white', backColor: '#EF4444' },
  { path: '/branches', label: 'branches', icon: GitBranch, fontColor: 'white', backColor: '#6366F1' },
  { path: '/holidays', label: 'holidays', icon: Caravan, fontColor: 'white', backColor: '#10B981' },
  { path: '/login', label: 'login', icon: Bird, fontColor: 'white', backColor: '#F59E0B' },
]

interface MenuItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  fontColor?: string
  backColor?: string
}

export default function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const user = useLiveQuery(() => db.user.toArray())
  const currentYear = new Date().getFullYear()
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  const userProfile = user && user.length > 0 ? user[0] : null

  const renderMenuItem = ({ path, label, icon: Icon, fontColor, backColor }: MenuItem) => {
    const isActive = location.pathname === path
    const baseClasses = 'flex items-center gap-2 px-3 py-2 rounded-md transition-colors'
    const activeClasses = 'bg-blue-500 text-white'
    const inactiveClasses = 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300'

    const style: React.CSSProperties = {}
    if (isActive) {
      if (backColor !== undefined) style.backgroundColor = backColor
      if (fontColor !== undefined) style.color = fontColor
    }

    return (
      <Link
        key={path}
        to={path}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        style={style}
      >
        <Icon className="w-8 h-8" />
        {t(`menu.${label}`)}
      </Link>
    )
  }

  const renderConfigMenuItem = ({ path, label, icon: Icon, fontColor, backColor }: MenuItem) => {
    const isActive = location.pathname === path
    const baseClasses = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors'
    const activeClasses = 'bg-blue-500 text-white'
    const inactiveClasses = 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300'

    const style: React.CSSProperties = {}
    if (isActive) {
      if (backColor !== undefined) style.backgroundColor = backColor
      if (fontColor !== undefined) style.color = fontColor
    }

    return (
      <Link
        key={path}
        to={path}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        style={style}
      >
        <Icon className="w-8 h-8" />
        {t(`menu.${label}`)}
      </Link>
    )
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
      <div>
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="ml-10 w-20 h-20 rounded-lg bg-blue-700 flex items-center justify-center text-slate-300 shadow-md">
            <LayoutDashboard className="w-16 h-16" />
          </div>
        </div>

        {/* Menú principal */}
        <nav className="flex flex-col space-y-2">
          {(mainMenu as MenuItem[]).map(renderMenuItem)}

          {/* Configuration dropdown */}
          <div>
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors ${
                isConfigOpen || configMenu.some(item => location.pathname === item.path)
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-8 h-8" />
                {t('menu.configuration')}
              </span>
              {isConfigOpen ? (
                <ChevronDown className="w-8 h-8" />
              ) : (
                <ChevronRight className="w-8 h-8" />
              )}
            </button>

            {isConfigOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {(configMenu as MenuItem[]).map(renderConfigMenuItem)}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Perfil + Copyright */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <Link
          to="/profile"
          className="flex items-center gap-3 mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md p-2 transition"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow">
            <User className="w-8 h-8" />
          </div>
          {userProfile ? (
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {userProfile.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {userProfile.role || 'Usuario'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-medium text-gray-500 dark:text-gray-400">
                {t('profile.noUser')}
              </span>
            </div>
          )}
        </Link>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
          © {currentYear} WinSystems Intl
        </p>
      </div>
    </aside>
  )
}