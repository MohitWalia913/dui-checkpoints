export function MapLocatorSkeleton() {
  return (
    <div className="flex h-full min-h-[480px] flex-col lg:flex-row">
      <div className="h-[42vh] w-full shrink-0 animate-pulse border-b border-white/10 bg-white/5 lg:h-full lg:max-w-[400px] lg:border-r lg:border-b-0" />
      <div className="relative min-h-[50vh] flex-1 animate-pulse bg-[#0a1628] lg:min-h-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-montserrat text-sm font-medium text-white/40">
            Loading map…
          </p>
        </div>
      </div>
    </div>
  );
}
