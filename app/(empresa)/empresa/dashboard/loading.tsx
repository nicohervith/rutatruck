export default function Loading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F5F5" }}>
      <div className="h-[57px]" style={{ backgroundColor: "#0A1A1A" }} />
      <div className="max-w-lg mx-auto px-5 py-8 space-y-4">
        <div className="h-8 rounded-full bg-white animate-pulse w-1/2" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white animate-pulse h-20" style={{ borderColor: "#E2E8E8" }} />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white animate-pulse h-16" style={{ borderColor: "#E2E8E8" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
