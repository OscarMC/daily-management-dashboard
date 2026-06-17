import React, { useState, useMemo } from 'react';
import { useMyJiraIssues } from '../hooks/useMyJiraIssues';
import JiraStatusExtended from '../components/JiraStatusExtended';
import { Search, Filter, ArrowUpDown, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type SortField = 'updated' | 'status' | 'priority' | 'key';

export default function MyJiraIssues() {
  const { t } = useTranslation();
  const { issues, loading, error, refresh } = useMyJiraIssues();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedIssues = useMemo(() => {
    let result = issues.filter(issue => {
      const matchesSearch = 
        issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || issue.status.toLowerCase().includes(statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      
      if (sortField === 'updated') {
        return sortOrder === 'desc' 
          ? new Date(valB).getTime() - new Date(valA).getTime()
          : new Date(valA).getTime() - new Date(valB).getTime();
      }

      if (sortOrder === 'desc') {
        return valB.toString().localeCompare(valA.toString());
      } else {
        return valA.toString().localeCompare(valB.toString());
      }
    });

    return result;
  }, [issues, searchTerm, statusFilter, sortField, sortOrder]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(issues.map(i => i.status));
    return Array.from(statuses);
  }, [issues]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (loading && issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
        <p className="text-gray-500">Cargando tus tareas de Jira...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button 
          onClick={refresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={18} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tareas Asignadas #{filteredAndSortedIssues.length || 0}</h1>
        <button 
          onClick={refresh}
          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
          title="Actualizar lista"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por clave o título... p. ej.: 'WIGOS-100000'"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleSort('updated')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${sortField === 'updated' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            <ArrowUpDown size={16} />
            <span className="text-sm">Fecha</span>
          </button>
          <button
            onClick={() => toggleSort('priority')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${sortField === 'priority' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            <ArrowUpDown size={16} />
            <span className="text-sm">Prioridad</span>
          </button>
        </div>
      </div>

      {/* Lista de Issues */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAndSortedIssues.length > 0 ? (
          filteredAndSortedIssues.map(issue => (
            <JiraStatusExtended key={issue.key} issue={issue} />
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500">No se encontraron tareas con los filtros actuales.</p>
          </div>
        )}
      </div>
    </div>
  );
}