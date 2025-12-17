// src/pages/PrsPage.tsx
import { useState, useEffect, useRef } from 'react';
import { usePullRequests, PullRequest } from '../hooks/usePullRequests';
import PrStatusBadge from '../components/PrStatusBadge';
import PrRegistrationModal from '../components/PrRegistrationModal';
import { FolderGit2, GitBranch, ExternalLink, Plus, MoreVertical, Search, Trash2, Copy, Pencil } from 'lucide-react';
import { useRepositories } from '../db/repositoriesStore';
import { toast } from '../components/common/ToastStack';

export default function PrsPage() {
 const { prs, loading, createPr, updatePrStatus, deletePr } = usePullRequests();
 const { repositories } = useRepositories();

 const [isPrModalOpen, setIsPrModalOpen] = useState(false);
 const [prToRegister, setPrToRegister] = useState<{
  taskId: string;
  taskTitle: string;
  repositoryId: string;
  repositoryName: string;
  branch: string;
  prToEdit?: PullRequest;
 } | null>(null);

 // 👇 Filtros
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState<string>('all');

 // 👇 Menú desplegable por PR
 const [openMenuId, setOpenMenuId] = useState<number | null>(null);
 const menuRef = useRef<HTMLDivElement>(null);

 // Cerrar menú al hacer clic fuera
 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
   if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
    setOpenMenuId(null);
   }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 // 👇 Detectar parámetros en el hash
 useEffect(() => {
  const handleHashChange = () => {
   const hash = window.location.hash;
   if (hash.startsWith('#/prs?')) {
    const searchPart = hash.split('?')[1] || '';
    const params = new URLSearchParams(searchPart);

    const taskId = params.get('taskId');
    const title = params.get('title');
    const branch = params.get('branch');
    const repo = params.get('repo');

    if (taskId && title && branch && repo) {
     const repoObj = repositories.find(r => String(r.id) === repo);
     setPrToRegister({
      taskId,
      taskTitle: title,
      repositoryId: repo,
      repositoryName: repoObj?.name || repo,
      branch,
     });
     setIsPrModalOpen(true);

     window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/prs');
    }
   }
  };

  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
 }, [repositories]);

 const handleSavePr = async (pr: Omit<PullRequest, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }) => {
  try {
   if (prToRegister?.prToEdit) {
    // Actualizar
    await updatePrStatus(prToRegister.prToEdit.id, pr.status);
    // Nota: tu hook actual no tiene `updatePr` completo, solo status.
    // Si necesitas edición completa, deberás extender el hook.
    toast('✅ PR actualizado.', 'success');
   } else {
    // Crear nuevo
    await createPr(pr);
    toast('✅ PR registrado correctamente.', 'success');
   }
   setIsPrModalOpen(false);
   setPrToRegister(null);
  } catch (err) {
   console.error('Error saving PR:', err);
   toast('❌ Error al registrar el PR.', 'error');
  }
 };

 const handleDeletePr = async (id: number, title: string) => {
  if (!confirm(`¿Eliminar el PR "${title}"? Esta acción no se puede deshacer.`)) return;
  try {
   await deletePr(id);
   toast('🗑️ PR eliminado.', 'success');
  } catch (err) {
   console.error('Error deleting PR:', err);
   toast('❌ Error al eliminar el PR.', 'error');
  }
 };

 const handleClonePr = (original: PullRequest) => {
  const cloned: typeof original = {
   ...original,
   id: 0, // será asignado por backend
   title: `${original.title} (copia)`,
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString(),
  };
  // Abrir modal en modo "crear" con datos clonados
  const repoObj = repositories.find(r => String(r.id) === cloned.repositoryId);
  setPrToRegister({
   taskId: String(cloned.taskId),
   taskTitle: cloned.title,
   repositoryId: cloned.repositoryId,
   repositoryName: repoObj?.name || cloned.repositoryId,
   branch: cloned.sourceBranch,
  });
  setIsPrModalOpen(true);
 };

 const getRepoName = (id: string) => {
  const repo = repositories.find(r => String(r.id) === id);
  return repo ? repo.name : id;
 };

 // 👇 Filtrar PRs
 const filteredPrs = prs.filter(pr => {
  const matchesSearch =
   pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
   pr.sourceBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
   pr.targetBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
   getRepoName(pr.repositoryId).toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
  return matchesSearch && matchesStatus;
 });

 if (loading) {
  return (
   <div className="p-6">
    <div className="text-gray-600 dark:text-gray-400">Cargando PRs...</div>
   </div>
  );
 }

 const statusOptions: PullRequest['status'][] = ['pending', 'in-review', 'approved', 'merged', 'blocked'];

 return (
  <div className="p-6">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mis Pull Requests</h1>
    <button
     onClick={() => setIsPrModalOpen(true)}
     className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
     <Plus size={16} />
     Registrar PR
    </button>
   </div>

   {/* Filtros */}
   <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="relative">
     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
     <input
      type="text"
      placeholder="Buscar por título, rama o repositorio..."
      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
    </div>
    <div>
     <select
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
     >
      <option value="all">Todos los estados</option>
      {statusOptions.map(status => (
       <option key={status} value={status}>
        {status === 'in-review' ? 'En revisión' : status.charAt(0).toUpperCase() + status.slice(1)}
       </option>
      ))}
     </select>
    </div>
   </div>

   {filteredPrs.length === 0 ? (
    <div className="text-center py-12">
     <p className="text-gray-500 dark:text-gray-400">
      {prs.length === 0 ? 'Aún no has registrado ningún Pull Request.' : 'No hay PRs que coincidan con los filtros.'}
     </p>
    </div>
   ) : (
    <div className="grid gap-4">
     {filteredPrs.map((pr) => (
      <div
       key={pr.id}
       className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm relative"
      >
       {/* Menú de acciones */}
       <div className="flex justify-between top-0 right-0 absolute items-end">
        <button
         onClick={() => setOpenMenuId(openMenuId === pr.id ? null : pr.id)}
         className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
         <MoreVertical size={20} />
        </button>

        {openMenuId === pr.id && (
         <div
          ref={menuRef}
          className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
         >
          <button
           onClick={() => {
            const repoObj = repositories.find(r => String(r.id) === pr.repositoryId);
            setPrToRegister({
             taskId: String(pr.taskId),
             taskTitle: pr.title,
             repositoryId: pr.repositoryId,
             repositoryName: repoObj?.name || pr.repositoryId,
             branch: pr.sourceBranch,
             prToEdit: pr,
            });
            setIsPrModalOpen(true);
            setOpenMenuId(null);
           }}
           className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
           <Pencil size={14} />
           Editar
          </button>
          <button
           onClick={() => {
            handleClonePr(pr);
            setOpenMenuId(null);
           }}
           className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
           <Copy size={14} />
           Clonar
          </button>
          <button
           onClick={() => {
            handleDeletePr(pr.id, pr.title);
            setOpenMenuId(null);
           }}
           className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
           <Trash2 size={14} />
           Eliminar
          </button>
         </div>
        )}
       </div>

       <div className="flex justify-between items-start border gap-2 p-4 rounded-lg">
        <div>
         <h3 className="font-semibold text-gray-800 dark:text-white">{pr.title}</h3>
         <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
           <FolderGit2 size={14} />
           {getRepoName(pr.repositoryId)}
          </div>
          <div className="flex items-center gap-1">
           <GitBranch size={14} />
           {pr.sourceBranch} → {pr.targetBranch}
          </div>
         </div>
         {pr.externalUrl && (
          <div className="mt-2">
           <a
            href={pr.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
           >
            <ExternalLink size={12} />
            Abrir en Bitbucket/Jira
           </a>
          </div>
         )}
         {pr.notes && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
           {pr.notes}
          </div>
         )}
        </div>
        <div className="flex flex-col items-end gap-10">
         <select
          value={pr.status}
          onChange={(e) => updatePrStatus(pr.id, e.target.value as PullRequest['status'])}
          className="px-2.5 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
         >
          {statusOptions.map((status) => (
           <option key={status} value={status}>
            {status === 'in-review' ? 'En revisión' : status.charAt(0).toUpperCase() + status.slice(1)}
           </option>
          ))}
         </select>
         <PrStatusBadge status={pr.status} />
        </div>
       </div>
      </div>
     ))}
    </div>
   )}

   {/* Modal de registro */}
   {isPrModalOpen && (
    <PrRegistrationModal
     taskId={prToRegister?.taskId || ''}
     taskTitle={prToRegister?.taskTitle || 'Nueva tarea'}
     repositoryId={prToRegister?.repositoryId || ''}
     repositoryName={prToRegister?.repositoryName || ''}
     branch={prToRegister?.branch || ''}
     onClose={() => {
      setIsPrModalOpen(false);
      setPrToRegister(null);
     }}
     onSave={handleSavePr}
    />
   )}
  </div>
 );
}