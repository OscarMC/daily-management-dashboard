export default function ProgressBar({
 completed,
 inProgress
}: {
 completed: number
 inProgress: number
}) {
 return (
  <div className="w-full h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden relative shadow-inner">
   {/* Completadas: verde */}
   <div
    className="h-full bg-emerald-500 transition-all duration-500 absolute top-0 left-0"
    style={{
     width: `${Math.min(completed, 100)}%`,
    }}
   />

   {/* En progreso: naranja, comienza justo después del verde */}
   <div
    className="h-full bg-orange-400 transition-all duration-500 absolute top-0"
    style={{
     left: `${Math.min(completed, 100)}%`,
     width: `${Math.min(inProgress, 100 - completed)}%`,
    }}
   />
  </div>


 )
}
