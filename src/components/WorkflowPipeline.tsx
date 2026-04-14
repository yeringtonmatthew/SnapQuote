import Link from 'next/link';

interface PipelineSegment {
  label: string;
  count: number;
  value: number;
  href: string;
  color: string;
  bgColor: string;
  iconPath: string;
}

const fmt = (n: number) =>
  n >= 1000
    ? '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    : '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 });

export default function WorkflowPipeline({
  approvedQuotes,
  approvedValue,
  activeJobs,
  activeJobsValue,
  requiresInvoicing,
  requiresInvoicingValue,
  awaitingPayment,
  awaitingPaymentValue,
}: {
  approvedQuotes: number;
  approvedValue: number;
  activeJobs: number;
  activeJobsValue: number;
  requiresInvoicing: number;
  requiresInvoicingValue: number;
  awaitingPayment: number;
  awaitingPaymentValue: number;
}) {
  const segments: PipelineSegment[] = [
    {
      label: 'Open Quotes',
      count: approvedQuotes,
      value: approvedValue,
      href: '/pipeline',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    },
    {
      label: 'Active Jobs',
      count: activeJobs,
      value: activeJobsValue,
      href: '/jobs',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconPath: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
    },
    {
      label: 'Ready to Bill',
      count: requiresInvoicing,
      value: requiresInvoicingValue,
      href: '/invoices',
      color: requiresInvoicing > 0 ? 'text-amber-600' : 'text-emerald-600',
      bgColor: requiresInvoicing > 0 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30',
      iconPath: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75',
    },
    {
      label: 'Money Due',
      count: awaitingPayment,
      value: awaitingPaymentValue,
      href: '/payments',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconPath: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="px-5 pb-3 pt-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gray-400">
          Jobs &amp; Money
        </p>
      </div>
      <div className="grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
        {segments.map((seg) => (
          <Link
            key={seg.label}
            href={seg.href}
            className={`flex flex-col items-center px-3 py-4 text-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 press-scale`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${seg.bgColor}`}>
              <svg className={`h-4.5 w-4.5 ${seg.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={seg.iconPath} />
              </svg>
            </div>
            <p className={`mt-2 text-[22px] font-bold tabular-nums ${seg.color}`}>
              {seg.count}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
              {seg.label}
            </p>
            {seg.value > 0 && (
              <p className="mt-1 text-[12px] font-semibold text-gray-400 tabular-nums">
                {fmt(seg.value)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
