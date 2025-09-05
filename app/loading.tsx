export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse-slow">
          <span className="text-white font-bold text-2xl">💎</span>
        </div>
        <h2 className="text-xl font-bold text-gradient mb-2">CryptoPulse</h2>
        <p className="text-textSecondary">Loading your alerts...</p>
        
        <div className="mt-6 space-y-3 max-w-md mx-auto">
          <div className="animate-pulse">
            <div className="h-4 bg-dark-surface rounded w-3/4 mx-auto"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-dark-surface rounded w-1/2 mx-auto"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-dark-surface rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
