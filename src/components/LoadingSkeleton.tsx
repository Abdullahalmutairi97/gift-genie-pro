export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-3">
          <div className="h-40 rounded-lg bg-muted animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/5 to-muted bg-[length:200%_100%]" />
          <div className="h-4 w-3/4 rounded bg-muted animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/5 to-muted bg-[length:200%_100%]" />
          <div className="h-3 w-1/2 rounded bg-muted animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/5 to-muted bg-[length:200%_100%]" />
        </div>
      ))}
    </div>
  );
}
