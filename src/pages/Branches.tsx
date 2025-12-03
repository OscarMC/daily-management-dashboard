// src/pages/Branches.tsx
import { useState } from 'react';
import { Plus, Trash2, GitBranch, Search, X, FolderGit2 } from 'lucide-react';
import { useBranches } from '../db/branchesStore';
import { useRepositories } from '../db/repositoriesStore';
import { toast, useToastStack } from '../components/common/ToastStack';

export default function Branches() {
 const { branches, addBranch, updateBranch, deleteBranch } = useBranches();
 const { repositories } = useRepositories();
 const { ToastContainer } = useToastStack();

 const [newBranch, setNewBranch] = useState({
  name: '',
  base: '',
  description: '',
  repositoryId: ''
 });
 const [searchTerm, setSearchTerm] = useState('');

 const handleAdd = () => {
  if (!newBranch.name.trim()) {
   toast('⚠️ El nombre de la rama es obligatorio.', 'warn');
   return;
  }
  addBranch({
   name: newBranch.name,
   base: newBranch.base,
   description: newBranch.description,
   repositoryId: newBranch.repositoryId ? Number(newBranch.repositoryId) : undefined
  });
  setNewBranch({ name: '', base: '', description: '', repositoryId: '' });
  toast('✅ Rama creada correctamente.', 'success');
 };

 const handleUpdate = (id: number, field: string, value: string) => {
  updateBranch(id, { [field]: value });
  // Opcional: quita el toast si prefieres edición silenciosa
  // toast('💾 Cambios guardados.', 'info');
 };

 const handleDelete = (id: number) => {
  deleteBranch(id);
  toast('🗑️ Rama eliminada correctamente.', 'warn');
 };

 // Filtrado en tiempo real
 const filteredBranches = branches.filter(b =>
  b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  b.base.toLowerCase().includes(searchTerm.toLowerCase()) ||
  b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (b.repositoryId &&
   repositories.find(r => r.id === b.repositoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
 );

 return (
  <div className="p-6 max-w-5xl mx-auto">
   <ToastContainer />

   {/* Header con título y buscador */}
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div className="flex items-center gap-3">
     <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
      <GitBranch className="text-purple-600 dark:text-purple-400" size={24} />
     </div>
     <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Branches</h1>
    </div>

    {/* Campo de búsqueda */}
    <div className="relative w-full sm:w-64">
     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Search className="h-4 w-4 text-gray-400" />
     </div>
     <input
      type="text"
      placeholder="Search branches..."
      className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
     {searchTerm && (
      <button
       onClick={() => setSearchTerm('')}
       className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
       aria-label="Clear search"
      >
       <X size={16} />
      </button>
     )}
    </div>
   </div>

   {/* Formulario de alta */}
   <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_160px_140px] gap-3 items-end">
     <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
      <input
       type="text"
       placeholder="feature/login"
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
       value={newBranch.name}
       onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
      />
     </div>
     <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Base</label>
      <input
       type="text"
       placeholder="develop"
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
       value={newBranch.base}
       onChange={(e) => setNewBranch({ ...newBranch, base: e.target.value })}
      />
     </div>
     <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción</label>
      <input
       type="text"
       placeholder="Implementa login con JWT"
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
       value={newBranch.description}
       onChange={(e) => setNewBranch({ ...newBranch, description: e.target.value })}
      />
     </div>
     <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Repositorio</label>
      <select
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
       value={newBranch.repositoryId}
       onChange={(e) => setNewBranch({ ...newBranch, repositoryId: e.target.value })}
      >
       <option value="">Sin repositorio</option>
       {repositories.map((r) => (
        <option key={r.id} value={r.id}>
         {r.name}
        </option>
       ))}
      </select>
     </div>
     <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
     >
      <Plus size={16} /> Añadir Rama
     </button>
    </div>
   </div>

   {/* Lista de ramas */}
   {filteredBranches.length > 0 ? (
    <div className="space-y-4">
     {filteredBranches.map((b) => (
      <div
       key={b.id}
       className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
      >
       <div className="flex flex-wrap items-start gap-4">
        {/* Icono + nombre */}
        <div className="flex items-center gap-2 min-w-[200px]">
         <GitBranch className="text-purple-500" size={18} />
         <input
          type="text"
          className="flex-1 font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-purple-500 pb-1"
          value={b.name}
          onChange={(e) => handleUpdate(b.id, 'name', e.target.value)}
          placeholder="Nombre de rama"
         />
        </div>

        {/* Base */}
        <div className="flex-1 min-w-[120px]">
         <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Base</label>
         <input
          type="text"
          className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500"
          value={b.base}
          onChange={(e) => handleUpdate(b.id, 'base', e.target.value)}
          placeholder="develop"
         />
        </div>

        {/* Descripción */}
        <div className="flex-1 min-w-[200px]">
         <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Descripción</label>
         <input
          type="text"
          className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500"
          value={b.description}
          onChange={(e) => handleUpdate(b.id, 'description', e.target.value)}
          placeholder="Detalles de la rama"
         />
        </div>

        {/* Repositorio vinculado */}
        <div className="flex-1 min-w-[160px]">
         <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Repositorio</label>
         <div className="flex items-center gap-1">
          <FolderGit2 className="text-gray-500 dark:text-gray-400" size={14} />
          <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
           {repositories.find(r => r.id === b.repositoryId)?.name || 'Ninguno'}
          </span>
         </div>
        </div>

        {/* Acción de eliminar */}
        <div className="flex items-start mt-4 md:mt-0">
         <button
          onClick={() => handleDelete(b.id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Eliminar rama"
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
     <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
     <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
      {searchTerm ? 'No branches found' : 'No branches created yet'}
     </h3>
     <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {searchTerm
       ? 'Try a different search term.'
       : 'Add your first branch using the form above.'}
     </p>
    </div>
   )}
  </div>
 );
}