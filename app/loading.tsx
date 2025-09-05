export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-dark-text mb-2">Loading CryptoPulse</h2>
        <p className="text-dark-textSecondary">Preparing your crypto alerts...</p>
      </div>
    </div>
  );
}
