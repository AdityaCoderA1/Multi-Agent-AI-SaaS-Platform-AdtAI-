import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPreferredModel } from '../redux/user.slice';

export default function ModelSelector() {
  const dispatch = useDispatch();
  const preferredModel = useSelector(state => state.user.preferredModel || 'auto');

  const models = [
    { id: 'auto', label: 'Auto (Recommended)' },
    { id: 'gemini', label: 'Gemini 2.5 Flash' },
    { id: 'llama', label: 'Llama 3.3 70B' },
    { id: 'deepseek', label: 'DeepSeek Chat' },
  ];

  return (
    <div className="relative inline-block text-left">
      <select
        value={preferredModel}
        onChange={(e) => dispatch(setPreferredModel(e.target.value))}
        className="block w-full pl-3 pr-8 py-1.5 text-[13px] font-medium text-brand-text bg-brand-card border border-brand-border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-300"
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.label}
          </option>
        ))}
      </select>
    </div>
  );
}
