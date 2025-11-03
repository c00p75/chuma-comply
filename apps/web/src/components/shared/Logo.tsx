import { cn } from '@/lib/utils';

type Props = { className?: string };

export function Logo({ className }: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)} aria-label="Chuma Comply">
      <div className="size-6 rounded-md bg-indigo-600" />
      <span className="font-semibold">Chuma Comply</span>
    </div>
  );
}

export default Logo;


