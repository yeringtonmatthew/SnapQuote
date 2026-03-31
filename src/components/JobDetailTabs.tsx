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
    <div className="sticky top-[57px] z-[9] bg-[#f2f2f7] px-4 pb-2 pt-3">
      <div className="mx-auto max-w-lg">
        <div className="flex gap-1 rounded-full bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`flex-1 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
                activeTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
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
