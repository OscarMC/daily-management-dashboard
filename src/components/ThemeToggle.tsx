import { useTheme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

export const ThemeToggle = () => {
 const { theme, toggleTheme } = useTheme()
 return (
  <button
   onClick={toggleTheme}
   className="flex items-center justify-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700"
   title="Toggle theme"
  >
   {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
  </button>
 )
}
