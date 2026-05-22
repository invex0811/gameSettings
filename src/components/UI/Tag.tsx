import React from 'react';

interface TagProps {
  label: string;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider bg-violet-950/60 text-violet-400 border border-violet-800/40">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-violet-600 hover:text-violet-300 transition-colors ml-0.5"
          type="button"
          aria-label={`Remove tag ${label}`}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};
