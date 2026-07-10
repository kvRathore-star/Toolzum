export default function HealthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="text-center space-y-2">
        <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto" />
        <p className="text-sm font-mono text-[var(--text-muted)]">All systems nominal</p>
      </div>
    </div>
  );
}
