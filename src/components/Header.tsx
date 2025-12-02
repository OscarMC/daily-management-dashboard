import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from './LanguageSelector'
import { useTranslation } from 'react-i18next'

export default function Header() {
 const { t } = useTranslation()

 return (
  <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
   <h1 className="text-lg font-semibold">{t('app.title')}</h1>
   <div className="flex items-center gap-4">
    <LanguageSelector />
    <ThemeToggle />
   </div>
  </header>
 )
}
