import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from './LanguageSelector'
import { useTranslation } from 'react-i18next'

export default function Header() {
 const { t } = useTranslation()

 return (
  <header className="relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
   {/* Izquierda: invisible, pero ocupa espacio igual al de la derecha */}
   <div aria-hidden="true" className="flex items-center gap-4 invisible">
    <LanguageSelector />
    <ThemeToggle />
   </div>

   {/* Título centrado absolutamente en el centro del header */}
   <h1 className="text-2xl font-semibold absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
    {t('app.title')}
   </h1>

   {/* Derecha: controles reales */}
   <div className="flex items-center gap-4">
    <LanguageSelector />
    <ThemeToggle />
   </div>
  </header>
 )
}
