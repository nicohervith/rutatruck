export default function Loading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F5F5" }}>
      <div className="h-[57px]" style={{ backgroundColor: "#0A1A1A" }} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-white animate-pulse" style={{ borderColor: "#E2E8E8" }}>
            <div className="p-4 space-y-3">
              <div className="h-4 rounded-full bg-gray-100 w-2/3" />
              <div className="h-3 rounded-full bg-gray-100 w-1/2" />
              <div className="flex gap-3 pt-1">
                <div className="h-3 rounded-full bg-gray-100 w-1/4" />
                <div className="h-3 rounded-full bg-gray-100 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
