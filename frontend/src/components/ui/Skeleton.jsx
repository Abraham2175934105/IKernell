import React from 'react';

/**
 * Bloque Base de Skeleton con animación Shimmer
 */
export const Skeleton = ({ className = '', rounded = 'rounded-xl', ...props }) => {
  return (
    <div
      className={`bg-zinc-200/80 dark:bg-zinc-800/80 shimmer-effect ${rounded} ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton para Tarjetas Métricas del Dashboard
 */
export const SkeletonMetricCard = () => (
  <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </div>
    <Skeleton className="h-7 w-28" />
    <Skeleton className="h-2.5 w-36" />
  </div>
);

/**
 * Skeleton para Grid de 3 o 4 Métricas
 */
export const SkeletonMetricGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonMetricCard key={i} />
    ))}
  </div>
);

/**
 * Skeleton para Tarjetas de Proyectos / Actividades
 */
export const SkeletonCard = ({ rows = 3 }) => (
  <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      {rows > 2 && <Skeleton className="h-3.5 w-2/3" />}
    </div>
    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
      <Skeleton className="h-6 w-24 rounded-lg" />
      <Skeleton className="h-6 w-16 rounded-lg" />
    </div>
  </div>
);

/**
 * Skeleton para Tablas de Datos
 */
export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
    {/* Header */}
    <div className="grid grid-cols-4 gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3.5 w-24" />
      ))}
    </div>
    {/* Rows */}
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid grid-cols-4 gap-4 p-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-3 ${c === 0 ? 'w-32' : c === 1 ? 'w-20' : 'w-24'}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton para Encabezado de Página o Proyecto
 */
export const SkeletonHeader = () => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
    <div className="space-y-2">
      <Skeleton className="h-3 w-28 rounded-full" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-11 w-36 rounded-xl" />
  </div>
);
