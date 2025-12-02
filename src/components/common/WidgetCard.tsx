interface WidgetCardProps {
 title: string
 value: string | number
 description?: string
 icon?: React.ReactNode
}

export default function WidgetCard({ title, value, description, icon }: WidgetCardProps) {
 return (
  <div className="bg-white dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
   <div className="flex items-center gap-2 mb-2">
    {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
    <h3 className="text-xl font-semibold  tracking-wide text-gray-500 dark:text-gray-400">
     {title}
    </h3>
   </div>
   <p className="text-center text-2xl font-bold text-gray-900 dark:text-gray-50">
    {value}
   </p>
   {description && (
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
     {description}
    </p>
   )}
  </div>
 )
}
