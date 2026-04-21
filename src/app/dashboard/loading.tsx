export default function Loading() {
  return (
    <div className="min-h-screen theme-text-primary">
      <div className="border-b theme-border">
        <div className="max-w-screen-2xl mx-auto px-6 py-6 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-28 rounded theme-card-muted animate-pulse" />
              <div className="flex gap-1">
                <div className="h-7 w-16 rounded-md theme-card-strong animate-pulse" />
                <div className="h-7 w-20 rounded-md theme-card-muted animate-pulse" />
              </div>
            </div>
            <div className="h-7 w-56 rounded theme-card-muted animate-pulse" />
            <div className="h-4 w-72 rounded theme-card-muted animate-pulse opacity-60" />
          </div>
          <div className="flex items-start gap-8">
            <div className="flex gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2 text-right">
                  <div className="h-7 w-10 rounded theme-card-muted animate-pulse ml-auto" />
                  <div className="h-3 w-14 rounded theme-card-muted animate-pulse opacity-60 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="rounded-xl border theme-border theme-card overflow-hidden">
          <div className="border-b theme-border theme-card-muted h-11" />
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="border-b theme-border px-4 py-4 flex items-center gap-4"
              style={{ opacity: 1 - i * 0.06 }}
            >
              <div className="h-4 w-6 rounded theme-card-muted animate-pulse" />
              <div className="h-5 w-12 rounded theme-card-muted animate-pulse" />
              <div className="h-4 flex-1 rounded theme-card-muted animate-pulse" />
              <div className="h-4 w-40 rounded theme-card-muted animate-pulse" />
              <div className="h-4 w-32 rounded theme-card-muted animate-pulse" />
              <div className="h-4 w-20 rounded theme-card-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
