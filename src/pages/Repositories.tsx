// src/pages/Repositories.tsx
import { useState } from 'react';
import { Plus, Trash2, Pencil, Save, FolderGit2, GitBranch, Search, X } from 'lucide-react';
import { useRepositories } from '../db/repositoriesStore';
import { useBranches } from '../db/branchesStore'; // ✅ Añadido
import { useToastStack, toast } from '../components/common/ToastStack';

export default function Repositories() {
 const { repositories, addRepository, updateRepository, deleteRepository } = useRepositories();
 const { branches } = useBranches(); // ✅ Obtenemos las ramas
 const [newRepo, setNewRepo] = useState('');
 const [editingId, setEditingId] = useState<number | null>(null);
 const [editingName, setEditingName] = useState('');
 const [searchTerm, setSearchTerm] = useState('');
 const [expandedRepos, setExpandedRepos] = useState<Record<number, boolean>>({});
 const { ToastContainer } = useToastStack();

 // Encontrar la rama "master" global (si existe)
 const globalMaster = branches.find(b =>
  b.name.toLowerCase() === 'master' &&
  (b.repositoryId === undefined || b.repositoryId === null)
 );

 // Filtrar repositorios por búsqueda
 const filteredRepos = repositories.filter(r =>
  r.name.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const handleAdd = async () => {
  const trimmed = newRepo.trim();
  if (!trimmed) {
   toast('Repository name cannot be empty.', 'warn');
   return;
  }

  const exists = repositories.some(r => r.name === trimmed);
  if (exists) {
   toast(`Repository "${trimmed}" already exists.`, 'warn');
   return;
  }

  await addRepository(trimmed);
  toast(`Repository "${trimmed}" added successfully.`, 'success');
  setNewRepo('');
 };

 const handleSaveEdit = async (id: number) => {
  const trimmed = editingName.trim();
  if (!trimmed) {
   toast('Repository name cannot be empty.', 'warn');
   return;
  }

  const exists = repositories.some(r => r.name === trimmed && r.id !== id);
  if (exists) {
   toast(`Repository "${trimmed}" already exists.`, 'warn');
   return;
  }

  const oldRepo = repositories.find(r => r.id === id);
  await updateRepository(id, trimmed);
  toast(`Repository "${oldRepo?.name}" renamed to "${trimmed}".`, 'info');
  setEditingId(null);
  setEditingName('');
 };

 const handleDelete = async (id: number) => {
  const repo = repositories.find(r => r.id === id);
  await deleteRepository(id);
  toast(`Repository "${repo?.name}" deleted.`, 'warn');
  // Cerrar si estaba expandido
  setExpandedRepos(prev => {
   const newExpanded = { ...prev };
   delete newExpanded[id];
   return newExpanded;
  });
 };

 const toggleExpand = (id: number) => {
  setExpandedRepos(prev => ({
   ...prev,
   [id]: !prev[id]
  }));
 };

 return (
  <div className="p-6 max-w-4xl mx-auto">
   <ToastContainer />

   {/* Header */}
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div className="flex items-center gap-3">
     <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
      <FolderGit2 className="text-blue-600 dark:text-blue-400" size={24} />
     </div>
     <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Repositories & Branches</h1>
    </div>

    <div className="relative w-full sm:w-64">
     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Search className="h-4 w-4 text-gray-400" />
     </div>
     <input
      type="text"
      placeholder="Search repositories..."
      className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
     {searchTerm && (
      <button
       onClick={() => setSearchTerm('')}
       className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
       <X size={16} />
      </button>
     )}
    </div>
   </div>

   {/* Formulario de alta */}
   <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
    <div className="flex flex-col sm:flex-row gap-3">
     <input
      type="text"
      placeholder="New repository name (case-sensitive)"
      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={newRepo}
      onChange={(e) => setNewRepo(e.target.value)}
     />
     <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
     >
      <Plus size={18} /> Add Repository
     </button>
    </div>
   </div>

   {/* Lista de repositorios con ramas */}
   {filteredRepos.length > 0 ? (
    <div className="space-y-4">
     {filteredRepos.map((repo) => {
      // Ramas específicas de este repositorio
      const repoBranches = branches.filter(b => b.repositoryId === repo.id);
      // ¿Tiene ramas? (incluyendo master global)
      const hasBranches = repoBranches.length > 0 || !!globalMaster;

      return (
       <div
        key={repo.id}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
       >
        {/* Cabecera del repositorio */}
        <div className="p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
          <FolderGit2 className="text-blue-600 dark:text-blue-400" size={20} />
          {editingId === repo.id ? (
           <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            autoFocus
           />
          ) : (
           <span className="font-semibold text-gray-800 dark:text-white">{repo.name}</span>
          )}
          {hasBranches && (
           <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
            {repoBranches.length + (globalMaster ? 1 : 0)} branches
           </span>
          )}
         </div>

         <div className="flex items-center gap-2">
          {hasBranches && (
           <button
            onClick={() => toggleExpand(repo.id)}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
            title={expandedRepos[repo.id] ? 'Collapse' : 'Expand'}
           >
            {expandedRepos[repo.id] ? '▲' : '▼'}
           </button>
          )}
          {editingId === repo.id ? (
           <button
            onClick={() => handleSaveEdit(repo.id)}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            title="Save changes"
           >
            <Save size={14} />
           </button>
          ) : (
           <button
            onClick={() => {
             setEditingId(repo.id);
             setEditingName(repo.name);
            }}
            className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
            title="Edit repository"
           >
            <Pencil size={14} />
           </button>
          )}
          <button
           onClick={() => handleDelete(repo.id)}
           className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
           title="Delete repository"
          >
           <Trash2 size={14} />
          </button>
         </div>
        </div>

        {/* Ramas (solo si está expandido) */}
        {expandedRepos[repo.id] && hasBranches && (
         <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 mt-3">
           {/* Rama master global */}
           {globalMaster && (
            <div className="flex items-center gap-2 pl-4 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded">
             <GitBranch className="text-purple-500" size={14} />
             <span className="text-sm font-mono text-gray-700 dark:text-gray-300">master</span>
             <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
              global
             </span>
            </div>
           )}

           {/* Ramas específicas del repositorio */}
           {repoBranches.map((branch) => (
            <div key={branch.id} className="flex items-center gap-2 pl-4 py-1.5">
             <GitBranch className="text-purple-500" size={14} />
             <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{branch.name}</span>
             {branch.base && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
               ← {branch.base}
              </span>
             )}
             {branch.description && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
               {branch.description}
              </span>
             )}
            </div>
           ))}

           {repoBranches.length === 0 && !globalMaster && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic pl-4">
             No branches
            </p>
           )}
          </div>
         </div>
        )}
       </div>
      );
     })}
    </div>
   ) : (
    <div className="text-center py-12">
     <FolderGit2 className="mx-auto h-12 w-12 text-gray-400" />
     <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
      {searchTerm ? 'No repositories found' : 'No repositories added yet'}
     </h3>
     <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {searchTerm
       ? 'Try a different search term.'
       : 'Add your first repository using the form above.'}
     </p>
    </div>
   )}
  </div>
 );
}