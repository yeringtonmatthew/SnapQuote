'use client';

interface JobDetailTabsProps {
  activeTab: 'quote' | 'job' | 'activity';
  onTabChange: (tab: 'quote' | 'job' | 'activity') => void;
  taskCount?: number;
  noteCount?: number;
  photoCount?: number;
}

const TABS: { value: 'quote' | 'job' | 'activity'; label: string; icon: string }[] = [
  { value: 'quote', label: 'Overview', icon: 'doc' },
  { value: 'job', label: 'Job', icon: 'wrench' },
  { value: 'activity', label: 'Activity', icon: 'clock' },
];

function TabIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || 'h-4 w-4';
  switch (icon) {
    case 'doc':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case 'wrench':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-3.06a1.5 1.5 0 010-2.58l5.1-3.06a1.5 1.5 0 012.08.54l.27.48a1.5 1.5 0 01-.54 2.08L10.2 12l3.03 2.43a1.5 1.5 0 01.54 2.08l-.27.48a1.5 1.5 0 01-2.08.54z" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export function JobDetailTabs({ activeTab, onTabChange, taskCount, noteCount, photoCount }: JobDetailTabsProps) {
  return (
    <div className="sticky top-[57px] z-[9] bg-[#f2f2f7]/95 dark:bg-gray-950/95 backdrop-blur-md px-4 pb-2 pt-3">
      <div className="mx-auto max-w-lg">
        <div className="flex gap-0.5 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 p-[3px]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            // Show badge count based on tab
            const badge =
              tab.value === 'job' && taskCount != null && taskCount > 0 ? taskCount :
              tab.value === 'activity' && noteCount != null && noteCount > 0 ? noteCount :
              null;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-[10px] px-3 py-[7px] text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.03)]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <TabIcon icon={tab.icon} className={`h-3.5 w-3.5 ${isActive ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`} />
                {tab.label}
                {badge != null && (
                  <span className={`ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                    isActive
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'bg-gray-300/60 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
