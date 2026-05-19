import React from 'react';

interface TagProps {
  label: string;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-indigo-400 hover:text-indigo-200 transition-colors ml-0.5"
          type="button"
          aria-label={`Remove tag ${label}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};
