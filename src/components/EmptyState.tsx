import Link from 'next/link';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 text-gray-300 dark:text-gray-600">
        {icon}
      </div>
      <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </p>
      <p className="mt-1.5 max-w-[260px] text-[14px] leading-relaxed text-gray-400 dark:text-gray-500">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-95 hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
