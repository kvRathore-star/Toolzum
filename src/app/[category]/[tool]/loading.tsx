export default function Loading() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-8 animate-pulse flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] mb-6"></div>
        <div className="h-6 bg-[var(--bg-elevated)] rounded-md w-1/3 mb-4"></div>
        <div className="h-4 bg-[var(--bg-elevated)] rounded-md w-1/2 mb-8"></div>
        <div className="w-full h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] mb-4"></div>
        <div className="w-full h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)]"></div>
      </div>
    </div>
  );
}
