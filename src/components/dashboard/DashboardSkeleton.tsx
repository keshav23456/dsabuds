export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-900">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-neutral-900 rounded-lg"></div>
          <div className="h-4 w-64 bg-neutral-900/60 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-neutral-900 rounded-xl"></div>
      </div>

      {/* Grid Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Stats Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-3">
                <div className="h-3 w-16 bg-neutral-900 rounded"></div>
                <div className="h-7 w-12 bg-neutral-900 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Main Visual/Chart Section */}
          <div className="h-64 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col justify-between">
            <div className="h-4 w-32 bg-neutral-900 rounded"></div>
            <div className="flex items-end justify-between h-40 pt-4 px-2">
              {[60, 80, 45, 90, 30, 70, 50, 85, 40, 95].map((h, i) => (
                <div key={i} className="w-[8%] bg-neutral-900 rounded-t-lg" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Section */}
        <div className="space-y-6">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4">
            <div className="h-4 w-28 bg-neutral-900 rounded"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div className="h-4 w-24 bg-neutral-900 rounded"></div>
                  <div className="h-4 w-12 bg-neutral-900 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
