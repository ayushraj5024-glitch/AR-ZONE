import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { format, subDays, startOfMonth, startOfToday, startOfYesterday } from 'date-fns';

interface DateRangeFilterProps {
  onRangeSelect: (start: Date, end: Date) => void;
}

export default function DateRangeFilter({ onRangeSelect }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('Today');

  const handleSelect = (label: string, start: Date, end: Date) => {
    setSelectedLabel(label);
    setIsOpen(false);
    onRangeSelect(start, end);
  };

  const ranges = [
    { label: 'Today', getDates: () => [startOfToday(), new Date()] },
    { label: 'Yesterday', getDates: () => [startOfYesterday(), startOfYesterday()] },
    { label: 'Last 7 Days', getDates: () => [subDays(new Date(), 7), new Date()] },
    { label: 'This Month', getDates: () => [startOfMonth(new Date()), new Date()] },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-\(--primary\)/30 rounded px-3 py-1.5 text-sm focus:outline-none bg-[#05100a] text-slate-300 hover:border-\(--primary\) transition-colors min-w-40"
      >
        <CalendarIcon size={14} className="text-\(--primary\)" />
        <span className="flex-1 text-left">{selectedLabel}</span>
        <ChevronDown size={14} className="text-slate-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            className="absolute top-10 left-0 w-48 bg-[#05100a] border border-\(--primary\)/30 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {ranges.map((r) => (
              <div 
                key={r.label}
                onClick={() => {
                  const [start, end] = r.getDates();
                  handleSelect(r.label, start, end);
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-\(--primary\)/10 transition-colors ${selectedLabel === r.label ? 'text-\(--primary\) bg-\(--primary\)/5 font-medium' : 'text-slate-300'}`}
              >
                {r.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
