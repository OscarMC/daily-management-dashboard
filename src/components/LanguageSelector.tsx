import { useTranslation } from 'react-i18next'

export const LanguageSelector = () => {
 const { i18n } = useTranslation()
 const changeLang = (lang: string) => i18n.changeLanguage(lang)

 return (
  <select
   onChange={(e) => changeLang(e.target.value)}
   value={i18n.language}
   className="rounded-md bg-gray-100 dark:bg-slate-700 p-1 text-sm"
  >
   <option value="en">EN</option>
   <option value="es">ES</option>
   <option value="ca">CA</option>
  </select>
 )
}
