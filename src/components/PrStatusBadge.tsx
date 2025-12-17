// src/components/PrStatusBadge.tsx
import React from 'react';
import './PrStatusBadge.css'; // lo definimos abajo

type PrStatus = 'pending' | 'in-review' | 'approved' | 'merged' | 'blocked';

interface PrStatusBadgeProps {
 status: PrStatus;
 onClick?: () => void;
}

const statusLabels: Record<PrStatus, string> = {
 pending: 'Pendiente',
 'in-review': 'En revisión',
 approved: 'Aprobado',
 merged: 'Mergeado',
 blocked: 'Bloqueado',
};

const PrStatusBadge: React.FC<PrStatusBadgeProps> = ({ status, onClick }) => {
 return (
  <span
   className={`pr-status-badge pr-status-${status}`}
   onClick={onClick}
   tabIndex={onClick ? 0 : undefined}
  >
   {statusLabels[status]}
  </span>
 );
};

export default PrStatusBadge;