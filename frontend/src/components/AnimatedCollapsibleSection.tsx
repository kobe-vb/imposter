import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface AnimatedCollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  borderColor?: string;
  titleColor?: string;
  icon?: ReactNode;
  badge?: string | number;
}

export default function AnimatedCollapsibleSection({
  title,
  children,
  defaultOpen = true,
  borderColor = 'border-purple-500/20',
  titleColor = 'text-white',
  icon,
  badge
}: AnimatedCollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen, children]);

  return (
    <div className={`bg-slate-800/50 backdrop-blur border ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className={titleColor}>{icon}</span>}
          <h3 className={`text-xl font-bold ${titleColor}`}>{title}</h3>
          {badge !== undefined && (
            <span className="bg-slate-700 px-3 py-1 rounded-full text-sm font-semibold text-slate-200">
              {badge}
            </span>
          )}
        </div>
        
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className={`h-6 w-6 ${titleColor}`} />
        </div>
      </button>

      <div
        ref={contentRef}
        style={{ height: height }}
        className="transition-all duration-300 ease-in-out overflow-hidden"
      >
        <div className="border-t border-slate-700">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
