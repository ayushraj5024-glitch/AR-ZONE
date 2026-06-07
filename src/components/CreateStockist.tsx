import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CreateStockistProps {
  onCancel: () => void;
}

export default function CreateStockist({ onCancel }: CreateStockistProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onCancel(); // navigate back
    }, 1000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">New Stockist</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span>Agents</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">Create Stockist</span>
        </div>
      </div>

      <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="bg-[#60999b] text-white px-4 py-3">
          <h3 className="font-semibold">New Stockist</h3>
        </div>

        <div className="p-6 max-w-4xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormRow label="User Id">
              <input type="text" value="SS291048" disabled className="form-input bg-[#020503]" />
            </FormRow>
            
            <FormRow label="First Name">
              <input type="text" placeholder="First Name" className="form-input" />
            </FormRow>
            
            <FormRow label="Last Name">
              <input type="text" placeholder="Last Name" className="form-input" />
            </FormRow>
            
            <FormRow label="Fix Limit" note="Fix Limit can be set from 0 to 1000.00">
              <input type="number" defaultValue="0" className="form-input" />
            </FormRow>
            
            <FormRow label="My Match Share" note="My Match Share can be set from 0 to 50.0">
              <input type="number" placeholder="Enter Share" className="form-input" />
            </FormRow>
            
            <FormRow label="Stockist Match Share" note="Stockist Match Share can be set from 0 to 50.0">
              <input type="number" defaultValue="0" className="form-input" />
            </FormRow>
            
            <FormRow label="Stockist Match Commission" note="Match Commission can be set from 0 to 3">
              <input type="number" defaultValue="0" className="form-input" />
            </FormRow>
            
            <FormRow label="Stockist Session Commission" note="Session Commission can be set from 0 to 3">
              <input type="number" defaultValue="0" className="form-input" />
            </FormRow>
            
            <FormRow label="Password">
              <input type="password" placeholder="Enter Password" className="form-input" />
            </FormRow>
            
            <FormRow label="Confirm Password">
              <input type="password" placeholder="Confirm Password" className="form-input" />
            </FormRow>

            <div className="pt-4 flex items-center space-x-3 pl-[30%]">
              <button 
                type="button" 
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#05100a] text-slate-200 border border-[#00ff88]/30 rounded hover:bg-[#020503] transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#60999b] text-white rounded hover:bg-[#4d7a7c] transition-colors text-sm font-medium flex items-center justify-center min-w-[120px] gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, children, note }: { label: string, children: React.ReactNode, note?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0">
      <label className="sm:w-[30%] pt-2 text-sm font-medium text-slate-200 text-right pr-6">
        {label}
      </label>
      <div className="flex-1 max-w-full">
        {children}
        {note && <p className="text-xs font-semibold text-slate-200 mt-1.5 flex items-center"><span className="text-slate-900 mr-1">Note :</span>{note}</p>}
      </div>
    </div>
  );
}
