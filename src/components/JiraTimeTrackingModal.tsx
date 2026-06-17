// JiraTimeTrackingModal.tsx
import React from 'react';
import { X, Timer, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface TimeTracking {
 originalEstimate?: string;
 remainingEstimate?: string;
 timeSpent?: string;
 originalEstimateSeconds: number;
 remainingEstimateSeconds: number;
 timeSpentSeconds: number;
}

interface JiraTimeTrackingModalProps {
 timeTracking: TimeTracking;
 onClose: () => void;
}

export default function JiraTimeTrackingModal({ timeTracking, onClose }: JiraTimeTrackingModalProps) {
 const formatSeconds = (seconds: number) => {
  if (seconds === 0) return '0h';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
 };

 const progress = timeTracking.originalEstimateSeconds > 0
  ? (timeTracking.timeSpentSeconds / timeTracking.originalEstimateSeconds) * 100
  : 0;

 const isOvertime = timeTracking.timeSpentSeconds > timeTracking.originalEstimateSeconds && timeTracking.originalEstimateSeconds > 0;

 return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
   <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
     <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
      <Timer size={20} className="text-orange-500" />
      Time Tracking
     </h3>
     <button
      onClick={onClose}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
     >
      <X size={20} />
     </button>
    </div>

    <div className="p-6 space-y-6">
     {/* Progress Bar */}
     <div>
      <div className="flex items-center justify-between mb-2 text-sm">
       <span className="text-gray-600 dark:text-gray-400">Progreso</span>
       <span className={`font-bold ${isOvertime ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
        {Math.round(progress)}%
       </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
       <div
        className={`h-full rounded-full transition-all ${isOvertime ? 'bg-red-500' : 'bg-blue-500'}`}
        style={{ width: `${Math.min(progress, 100)}%` }}
       />
      </div>
      {isOvertime && (
       <div className="flex items-center gap-2 mt-2 text-xs text-red-600 dark:text-red-400">
        <AlertCircle size={14} />
        <span>Tiempo estimado excedido</span>
       </div>
      )}
     </div>

     {/* Time Stats */}
     <div className="grid grid-cols-1 gap-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
       <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
        <Clock size={16} />
        <span className="text-xs font-medium">Estimación Original</span>
       </div>
       <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {formatSeconds(timeTracking.originalEstimateSeconds)}
       </div>
      </div>

      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
       <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
        <TrendingUp size={16} />
        <span className="text-xs font-medium">Tiempo Gastado</span>
       </div>
       <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {formatSeconds(timeTracking.timeSpentSeconds)}
       </div>
      </div>

      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
       <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
        <Timer size={16} />
        <span className="text-xs font-medium">Tiempo Restante</span>
       </div>
       <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {formatSeconds(timeTracking.remainingEstimateSeconds)}
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}