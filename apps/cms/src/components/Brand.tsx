'use client';

type BrandProps = {
  size?: 'sm' | 'md' | 'lg';
  showCms?: boolean;
  className?: string;
};

export default function Brand({ size = 'md', showCms = true, className = '' }: BrandProps) {
  const sizeClasses =
    size === 'sm'
      ? {
          pill: 'px-2 py-0.5 text-xs',
          cms: 'text-xs',
          gap: 'gap-1',
        }
      : size === 'lg'
      ? {
          pill: 'px-3 py-1.5 text-xl',
          cms: 'text-base',
          gap: 'gap-3',
        }
      : {
          pill: 'px-3 py-1 text-base',
          cms: 'text-sm',
          gap: 'gap-2',
        };

  return (
    <div className={`flex items-center ${sizeClasses.gap} ${className}`}>
      <span className={`bg-white text-black dark:bg-white dark:text-black rounded-lg shadow-sm font-extrabold tracking-wide ${sizeClasses.pill}`}>
        CExCIE
      </span>
      {showCms && (
        <span className={`text-white/90 dark:text-white/90 font-semibold ${sizeClasses.cms}`}>CMS</span>
      )}
    </div>
  );
}


