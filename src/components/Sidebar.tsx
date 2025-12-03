import { Home, ClipboardList, BarChart2, User, FolderGit2, Clock, GitBranch } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexieDB'

const menu = [
  { path: '/', label: 'dashboard', icon: Home },
  { path: '/daily-tasks', label: 'dailyTasks', icon: ClipboardList },
  { path: '/overview', label: 'overview', icon: BarChart2 },
  { path: '/repositories', label: 'repositories', icon: FolderGit2 },
  { path: '/branches', label: 'branches', icon: GitBranch },
  { path: '/working-day-summary', label: 'workingDay', icon: Clock },
  { path: '/login', label: 'login', icon: Clock },
  { path: '/holidays', label: 'holidays', icon: Clock }

]

export default function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const user = useLiveQuery(() => db.user.toArray())
  const currentYear = new Date().getFullYear()

  const userProfile = user && user.length > 0 ? user[0] : null

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
      {/* Menú principal */}
      <div>
        <h2 className="text-xl font-bold mb-6">{t('app.title')}</h2>
        <nav className="flex flex-col space-y-2">
          {menu.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location.pathname === path
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}
            >
              <Icon className="w-5 h-5" />
              {t(`menu.${label}`)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Perfil + Copyright */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <Link
          to="/profile"
          className="flex items-center gap-3 mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md p-2 transition"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow">
            <User className="w-5 h-5" />
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
