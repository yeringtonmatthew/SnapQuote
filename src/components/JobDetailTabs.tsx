'use client';

interface JobDetailTabsProps {
  activeTab: 'quote' | 'job' | 'activity';
  onTabChange: (tab: 'quote' | 'job' | 'activity') => void;
}

const TABS: { value: 'quote' | 'job' | 'activity'; label: string }[] = [
  { value: 'quote', label: 'Quote' },
  { value: 'job', label: 'Job' },
  { value: 'activity', label: 'Activity' },
];

export function JobDetailTabs({ activeTab, onTabChange }: JobDetailTabsProps) {
  return (
    <div className="sticky top-[57px] z-[9] bg-[#f2f2f7]/95 dark:bg-gray-950/95 backdrop-blur-md px-4 pb-2 pt-3">
      <div className="mx-auto max-w-lg">
        <div className="flex gap-0.5 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 p-[3px]">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`relative flex-1 rounded-[10px] px-4 py-[7px] text-[13px] font-semibold transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.03)]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
