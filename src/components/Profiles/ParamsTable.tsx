import React from 'react';
import { GameParam } from '../../types';
import { Button } from '../UI/Button';

interface ParamsTableProps {
  params: GameParam[];
  onChange: (params: GameParam[]) => void;
}

export const ParamsTable: React.FC<ParamsTableProps> = ({ params, onChange }) => {
  const addParam = () => {
    onChange([...params, { key: '', value: '' }]);
  };

  const updateParam = (index: number, field: 'key' | 'value', val: string) => {
    const updated = params.map((p, i) => (i === index ? { ...p, [field]: val } : p));
    onChange(updated);
  };

  const removeParam = (index: number) => {
    onChange(params.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {params.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-gray-500 px-1">
          <span>Key</span>
          <span>Value</span>
          <span />
        </div>
      )}
      {params.map((param, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
          <input
            type="text"
            value={param.key}
            onChange={(e) => updateParam(index, 'key', e.target.value)}
            placeholder="FOV"
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            value={param.value}
            onChange={(e) => updateParam(index, 'value', e.target.value)}
            placeholder="90"
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => removeParam(index)}
            className="text-gray-600 hover:text-red-400 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <Button type="button" variant="ghost" size="sm" onClick={addParam} className="mt-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add parameter
      </Button>
    </div>
  );
};
