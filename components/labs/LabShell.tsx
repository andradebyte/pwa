import Link from "next/link";

export default function LabShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3 px-1">
        <Link
          href="/labs"
          prefetch={false}
          className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
          <p className="text-[11px] text-gray-400 font-mono">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
