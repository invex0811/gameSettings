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
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span>Parameter</span>
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
            className="rounded-lg border border-pd-b1 bg-pd-bg/70 px-3 py-2 font-mono text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20"
          />
          <input
            type="text"
            value={param.value}
            onChange={(e) => updateParam(index, 'value', e.target.value)}
            placeholder="90"
            className="rounded-lg border border-pd-b1 bg-pd-bg/70 px-3 py-2 font-mono text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15"
          />
          <button
            type="button"
            onClick={() => removeParam(index)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
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
