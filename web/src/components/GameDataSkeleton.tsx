import * as React from 'react';

// Skeleton loader component
export function GameDataSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Board skeleton */}
      <div className="w-full max-w-[500px] mx-auto bg-neutral rounded-xl shadow-lg p-2">
        <div className="aspect-square bg-border rounded-lg" />
      </div>

      {/* Timers skeleton */}
      <div className="flex justify-between w-full mt-4 gap-4">
        <div className="flex-1 bg-border rounded-lg px-4 py-2">
          <div className="h-4 bg-neutral rounded w-1/4 mb-2" />
          <div className="h-8 bg-neutral rounded w-1/2" />
        </div>
        <div className="flex-1 bg-border rounded-lg px-4 py-2">
          <div className="h-4 bg-neutral rounded w-1/4 mb-2" />
          <div className="h-8 bg-neutral rounded w-1/2" />
        </div>
      </div>

      {/* Move history skeleton */}
      <div className="mt-4 bg-border rounded-lg p-4">
        <div className="h-4 bg-neutral rounded w-1/4 mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-neutral rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  );
} 