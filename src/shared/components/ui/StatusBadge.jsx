import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const isActive = status?.toLowerCase() === 'active';
  const colorClasses = isActive 
    ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]' 
    : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]';
  const dotColor = isActive ? 'bg-[#4CAF50]' : 'bg-[#F44336]';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-px rounded-full border text-[10px] font-semibold leading-tight ${colorClasses} ${className}`}>
      <span className={`h-1 w-1 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
}
