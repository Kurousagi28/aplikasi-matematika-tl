import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface KaTeXProps {
  math: string;
  display?: boolean;
  className?: string;
}

export const KTeX: React.FC<KaTeXProps> = ({ math, display = false, className = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(math, ref.current, {
          displayMode: display,
          throwOnError: false,
          trust: true,
        });
      } catch {
        if (ref.current) {
          ref.current.textContent = math;
        }
      }
    }
  }, [math, display]);

  return <span ref={ref} className={className} />;
};

export default KTeX;
