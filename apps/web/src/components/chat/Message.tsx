import type { ChatMessage } from '@/lib/types';
import Logo from '@/components/shared/Logo';
import { cn } from '@/lib/utils';
import { Info, Building2, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  
  // Collect and deduplicate all sources
  const getAllSources = (): Array<{ title: string; section?: string }> => {
    const sourceMap = new Map<string, { title: string; section?: string }>();
    
    // Collect sources from checklist items
    if (message.checklist && message.checklist.length > 0) {
      message.checklist.forEach((item) => {
        if (item.sources && item.sources.length > 0) {
          item.sources.forEach((source) => {
            // Use title as key for deduplication
            if (!sourceMap.has(source.title)) {
              sourceMap.set(source.title, { title: source.title, section: source.section });
            }
          });
        }
      });
    }
    
    // Also include sources from message.sources (if not already included)
    if (message.sources && message.sources.length > 0) {
      message.sources.forEach((source) => {
        if (!sourceMap.has(source.title)) {
          sourceMap.set(source.title, { title: source.title });
        }
      });
    }
    
    return Array.from(sourceMap.values());
  };
  
  const allSources = getAllSources();
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-1">
          <Logo className="text-sm" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 text-sm rounded-2xl',
          isUser ? 'bg-secondary' : 'glass'
        )}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        
        {/* Render structured checklist if available */}
        {!isUser && message.checklist && message.checklist.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-lg font-bold mb-2">Compliance Checklist:</div>
            {message.checklist.map((item) => (
              <div key={item.step} className="border-l-2 border-primary pl-3 py-2">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-xs flex items-center justify-center font-medium">
                    {item.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary">{item.title}</div>
                    <div className="text-xs mt-1 flex items-start gap-1.5">
                      <span>{item.description}</span>
                      <div className="relative group flex-shrink-0">
                        <Info className="size-3.5 text-text-secondary hover:text-primary cursor-help transition-colors" strokeWidth={2} />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10 transition-all duration-200">
                          <div className="bg-white border border-[color:var(--border-primary)] rounded-xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] min-w-[240px] max-w-[320px]">
                            <div className="space-y-3">
                              {/* Regulatory Body */}
                              <div className="flex items-start gap-2.5">
                                <Building2 className="size-4 text-text-secondary mt-0.5 flex-shrink-0" strokeWidth={2} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wide mb-1">Regulatory Body</div>
                                  <div className="text-sm font-semibold text-text-primary">{item.regulatoryBody}</div>
                                </div>
                              </div>
                              
                              {/* Divider */}
                              <div className="h-px bg-[color:var(--border-primary)]"></div>
                              
                              {/* Sources */}
                              {item.sources && item.sources.length > 0 && (
                                <>
                                  <div className="flex items-start gap-2.5">
                                    <FileText className="size-4 text-text-secondary mt-0.5 flex-shrink-0" strokeWidth={2} />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wide mb-1.5">Sources</div>
                                      <div className="space-y-1.5">
                                        {item.sources.map((source, idx) => (
                                          <div key={idx} className="text-xs text-text-primary leading-relaxed">
                                            <span className="font-medium">{source.title}</span>
                                            {source.section && (
                                              <span className="text-text-secondary ml-1">• {source.section}</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Divider */}
                                  <div className="h-px bg-[color:var(--border-primary)]"></div>
                                </>
                              )}
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-2">
                              <div className="w-3 h-3 bg-white border-r border-b border-[color:var(--border-primary)] rotate-45 transform origin-center"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Sources list at the end (deduplicated) */}
        {!isUser && allSources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[color:var(--border-primary)]">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="size-4 text-text-secondary" strokeWidth={2} />
              <div className="text-xs font-semibold text-text-primary uppercase tracking-wide">Sources</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {allSources.map((source, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-[color:var(--border-primary)] text-xs text-text-primary"
                >
                  <span className="font-medium">{source.title}</span>
                  {source.section && (
                    <span className="text-text-secondary text-[10px]">• {source.section}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


