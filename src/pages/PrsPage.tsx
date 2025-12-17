// src/pages/PrsPage.tsx
import { useState, useEffect } from 'react';
import { usePullRequests, PullRequest } from '../hooks/usePullRequests';
import PrStatusBadge from '../components/PrStatusBadge';
import PrRegistrationModal from '../components/PrRegistrationModal';
import { FolderGit2, GitBranch, ExternalLink, Plus } from 'lucide-react';
import { useRepositories } from '../db/repositoriesStore';
import { toast } from '../components/common/ToastStack';

export default function PrsPage() {
 const { prs, loading, createPr, updatePrStatus } = usePullRequests();
 const { repositories } = useRepositories();

 const [isPrModalOpen, setIsPrModalOpen] = useState(false);
 const [prToRegister, setPrToRegister] = useState<{
  taskId: string;
  taskTitle: string;
  repositoryId: string;
  branch: string;
 } | null>(null);

 // 👇 Detectar parámetros en el hash (incluso si ya estamos en la página)
 useEffect(() => {
  const handleHashChange = () => {
   const hash = window.location.hash;
   if (hash) {
    console.log('Current hash:', hash);
   }


   if (hash.startsWith('/prs?')) {
    const searchPart = hash.split('?')[1] || '';
    const params = new URLSearchParams(searchPart);

    const taskId = params.get('taskId');
    const title = params.get('title');
    const branch = params.get('branch');
    const repo = params.get('repo');

    console.log('Detected PR registration params:', { taskId, title, branch, repo });

    if (taskId && title && branch && repo) {
     setPrToRegister({
      taskId,
      taskTitle: title,
      repositoryId: repo,
      branch,
     });
     setIsPrModalOpen(true);

     // Limpiar parámetros, dejar solo #/prs
     window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/prs');
    }
   }
  };

  // Ejecutar al montar
  handleHashChange();

  // Escuchar cambios posteriores (ej: navegación desde modal)
  window.addEventListener('hashchange', handleHashChange);

  return () => {
   window.removeEventListener('hashchange', handleHashChange);
  };
 }, []);

 const handleSavePr = async (pr: Omit<PullRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
   await createPr(pr);
   toast('✅ PR registrado correctamente.', 'success');
  } catch (err) {
   console.error('Error saving PR:', err);
   toast('❌ Error al registrar el PR.', 'error');
  }
 };

 const getRepoName = (id: string) => {
  const repo = repositories.find(r => String(r.id) === id);
  return repo ? repo.name : id;
 };

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
   <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mis Pull Requests</h1>
    <button
     onClick={() => setIsPrModalOpen(true)}
     className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
     <Plus size={16} />
     Registrar PR
    </button>
   </div>

   {prs.length === 0 ? (
    <div className="text-center py-12">
     <p className="text-gray-500 dark:text-gray-400">
      Aún no has registrado ningún Pull Request.
     </p>
     <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
      Puedes registrar uno manualmente o desde una tarea WIGOS.
     </p>
    </div>
   ) : (
    <div className="grid gap-4">
     {prs.map((pr) => (
      <div
       key={pr.id}
       className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
      >
       <div className="flex justify-between items-start">
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
        <div className="flex flex-col items-end gap-2">
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