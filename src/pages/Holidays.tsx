// src/pages/Holidays.tsx
import { useState } from 'react';
import { Plus, Trash2, Calendar, Repeat, CalendarOff, Flag, MapPin, Search, X } from 'lucide-react';
import { useHolidays } from '../db/holidaysStore';
import type { Holiday } from '../db/holidaysStore';
import { toast, useToastStack } from '../components/common/ToastStack';

export default function Holidays() {
 const { holidays, addHoliday, updateHoliday, deleteHoliday } = useHolidays();
 const { ToastContainer } = useToastStack();

 const [newHoliday, setNewHoliday] = useState({
  date: '',
  nombre: '',
  tipo: 'nacional' as 'nacional' | 'local',
  recurrente: true
 });
 const [searchTerm, setSearchTerm] = useState('');

 const handleAdd = () => {
  if (!newHoliday.nombre.trim() || !newHoliday.date.trim()) {
   toast('⚠️ Nombre y fecha son obligatorios.', 'warn');
   return;
  }

  addHoliday({
   ...newHoliday,
   nombre: newHoliday.nombre.trim(),
   date: newHoliday.date.trim()
  }).then(() => {
   setNewHoliday({ date: '', nombre: '', tipo: 'nacional', recurrente: true });
   toast('✅ Festivo añadido.', 'success');
  }).catch(() => {
   toast('❌ Error al añadir festivo.', 'error');
  });
 };

 const handleUpdate = (id: number, field: keyof Holiday, value: any) => {
  updateHoliday(id, { [field]: value }).catch(() =>
   toast('❌ Error al guardar.', 'error')
  );
 };

 const handleDelete = (id: number) => {
  const name = holidays.find(h => h.id === id)?.nombre;
  deleteHoliday(id).then(() =>
   toast(`🗑️ "${name}" eliminado.`, 'warn')
  );
 };

 // Filtrado en tiempo real
 const filteredHolidays = holidays.filter(h =>
  h.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
  h.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
  h.tipo.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const datePlaceholder = newHoliday.recurrente ? 'MM-DD (ej. 12-25)' : 'YYYY-MM-DD (ej. 2025-12-25)';

 return (
  <div className="p-6 max-w-4xl mx-auto">
   <ToastContainer />

   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div className="flex items-center gap-3">
     <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
      <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
     </div>
     <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Días Festivos</h1>
    </div>

    {/* Campo de búsqueda */}
    <div className="relative w-full sm:w-64">
     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Search className="h-4 w-4 text-gray-400" />
     </div>
     <input
      type="text"
      placeholder="Buscar festivos..."
      className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
     {searchTerm && (
      <button
       onClick={() => setSearchTerm('')}
       className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
       aria-label="Limpiar búsqueda"
      >
       <X size={16} />
      </button>
     )}
    </div>
   </div>

   {/* Formulario de alta */}
   <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_100px_100px] gap-3 items-end">
     <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
      <input
       type="text"
       placeholder={datePlaceholder}
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       value={newHoliday.date}
       onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
      />
     </div>
     <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
      <input
       type="text"
       placeholder="Ej. Navidad"
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       value={newHoliday.nombre}
       onChange={(e) => setNewHoliday({ ...newHoliday, nombre: e.target.value })}
      />
     </div>
     <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
      <select
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
       value={newHoliday.tipo}
       onChange={(e) => setNewHoliday({ ...newHoliday, tipo: e.target.value as 'nacional' | 'local' })}
      >
       <option value="nacional">Nacional</option>
       <option value="local">Local</option>
      </select>
     </div>
     <div className="flex flex-col">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Recurrente</label>
      <div className="flex items-center gap-2">
       <input
        type="checkbox"
        checked={newHoliday.recurrente}
        onChange={(e) => setNewHoliday({ ...newHoliday, recurrente: e.target.checked })}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
       />
       <span className="text-sm text-gray-600 dark:text-gray-300">
        {newHoliday.recurrente ? <Repeat size={14} className="inline mr-1" /> : <CalendarOff size={14} className="inline mr-1" />}
       </span>
      </div>
     </div>
     <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
     >
      <Plus size={16} /> Añadir
     </button>
    </div>
   </div>

   {/* Resultados */}
   {filteredHolidays.length > 0 ? (
    <div className="space-y-4">
     {filteredHolidays.map((h) => (
      <div
       key={h.id}
       className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
      >
       <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col items-center justify-center w-20">
         <div className="text-lg font-bold text-gray-800 dark:text-white">
          {h.date}
         </div>
         <div className="flex gap-1 mt-1">
          {h.recurrente ? (
           <Repeat size={14} className="text-green-500" />
          ) : (
           <CalendarOff size={14} className="text-amber-500" />
          )}
          {h.tipo === 'nacional' ? (
           <Flag size={14} className="text-blue-500" />
          ) : (
           <MapPin size={14} className="text-purple-500" />
          )}
         </div>
        </div>

        <div className="flex-1 min-w-[200px]">
         <input
          type="text"
          className="w-full text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 pb-1"
          value={h.nombre}
          onChange={(e) => handleUpdate(h.id, 'nombre', e.target.value)}
          placeholder="Nombre del festivo"
         />
         <div className="flex flex-wrap gap-3 mt-3">
          <div>
           <label className="text-xs text-gray-500 dark:text-gray-400">Fecha</label>
           <input
            type="text"
            className="w-28 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
            value={h.date}
            onChange={(e) => handleUpdate(h.id, 'date', e.target.value)}
           />
          </div>
          <div>
           <label className="text-xs text-gray-500 dark:text-gray-400">Tipo</label>
           <select
            className="w-28 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
            value={h.tipo}
            onChange={(e) => handleUpdate(h.id, 'tipo', e.target.value)}
           >
            <option value="nacional">Nacional</option>
            <option value="local">Local</option>
           </select>
          </div>
          <div className="flex items-center gap-2 mt-4">
           <label className="text-xs text-gray-500 dark:text-gray-400">Recurrente</label>
           <input
            type="checkbox"
            checked={h.recurrente}
            onChange={(e) => handleUpdate(h.id, 'recurrente', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
           />
          </div>
         </div>
        </div>

        <div className="flex items-start">
         <button
          onClick={() => handleDelete(h.id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Eliminar festivo"
         >
          <Trash2 size={18} />
         </button>
        </div>
       </div>
      </div>
     ))}
    </div>
   ) : (
    <div className="text-center py-12">
     <Calendar className="mx-auto h-12 w-12 text-gray-400" />
     <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
      {searchTerm ? 'No se encontraron festivos' : 'No hay festivos configurados'}
     </h3>
     <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {searchTerm
       ? 'Prueba con otro término de búsqueda.'
       : 'Añade tu primer día festivo usando el formulario de arriba.'}
     </p>
    </div>
   )}
  </div>
 );
}