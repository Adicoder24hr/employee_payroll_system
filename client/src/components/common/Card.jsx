import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  glass = false,
  hoverable = false,
  noPadding = false,
  ...props
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        glass
          ? 'glass border-white/20 dark:border-slate-800/80 shadow-xl'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
      } ${hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center space-x-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
