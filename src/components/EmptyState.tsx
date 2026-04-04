import Link from 'next/link';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

function DefaultEmptyIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-300 dark:text-gray-600"
    >
      <path
        d="M6 14L20 7L34 14V26L20 33L6 26V14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6 14L20 21M20 21L34 14M20 21V33"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center px-6 py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="text-gray-300 dark:text-gray-600">
          {icon ?? <DefaultEmptyIcon />}
        </div>
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
      {secondaryAction && (
        <Link
          href={secondaryAction.href}
          className="mt-3 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          {secondaryAction.label}
        </Link>
      )}
    </div>
  );
}
