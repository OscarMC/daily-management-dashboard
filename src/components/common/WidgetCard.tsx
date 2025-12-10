interface WidgetCardProps {
 title: string
 value: string | number
 description?: string
 icon?: React.ReactNode
}

export default function WidgetCard({ title, value, description, icon }: WidgetCardProps) {
 return (
<div className="bg-white dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 flex">
  {/* Icono grande a la izquierda */}
  {icon && (
    <div className="flex-shrink-0 flex items-center justify-center mr-4">
      <span className="text-7xl text-gray-400 dark:text-gray-500">
        {icon}
      </span>
    </div>
  )}

  {/* Contenido principal: título, descripción y valor */}
  <div className="flex-1 flex flex-col justify-between min-w-0">
    {/* Título y descripción arriba */}
    <div className="min-w-0 border-b border-gray-200 dark:border-gray-400 text-center text-2xl">
      <h3 className="font-bold tracking-widest text-gray-500 dark:text-gray-400 truncate">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-2xl text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>

    {/* Valor grande abajo */}
    <p className="mt-5 text-4xl text-center font-bold text-gray-900 dark:text-lime-300">
      {value}
    </p>
  </div>
</div>
 )
}
