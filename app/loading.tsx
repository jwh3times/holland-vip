export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-line2"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-a-blue animate-spin"></div>
        </div>

        {/* Loading text */}
        <p className="text-muted text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
