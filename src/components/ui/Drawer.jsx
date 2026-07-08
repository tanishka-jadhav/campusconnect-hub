import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Drawer({ open, onClose, title, children }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => setAnimating(true));
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`drawer-overlay transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`drawer-panel ${animating ? 'animate-slide-in-right' : 'animate-slide-out-right'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </>
  );
}
