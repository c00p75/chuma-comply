import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

type Props = { 
  className?: string;
  onClick?: () => void;
};

export function Logo({ className, onClick }: Props) {
  const content = (
    <>
      <div className="size-8 md:size-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
        <MessageSquare className="size-4 md:size-5 text-white" />
      </div>
      <span className="font-semibold text-lg md:text-xl text-text-primary">Chuma Comply</span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn('flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity', className)}
        aria-label="Chuma Comply"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5', className)} aria-label="Chuma Comply">
      {content}
    </div>
  );
}

export default Logo;


