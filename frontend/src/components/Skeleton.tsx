// Reusable skeleton components for loading states

export function SkeletonLine({ width = '100%', height = 13 }: { width?: string | number; height?: number }) {
  return (
    <div
      className="skeleton skeleton-text"
      style={{ width, height, marginBottom: 8 }}
    />
  )
}

export function SkeletonBlock({ height = 200 }: { height?: number }) {
  return (
    <div className="skeleton" style={{ height, width: '100%', borderRadius: 10 }} />
  )
}

export function SkeletonCharts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <SkeletonLine width="60%" height={13} />
          <SkeletonBlock height={260} />
        </div>
        <div>
          <SkeletonLine width="60%" height={13} />
          <SkeletonBlock height={260} />
        </div>
      </div>
      <div>
        <SkeletonLine width="40%" height={13} />
        <SkeletonBlock height={220} />
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div>
      {/* Filter bar skeleton */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div className="skeleton" style={{ flex: 1, height: 36, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 140, height: 36, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 120, height: 36, borderRadius: 8 }} />
      </div>
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <div className="skeleton skeleton-text" style={{ width: 80, height: 12 }} />
          <div className="skeleton skeleton-text" style={{ flex: 1, height: 12 }} />
          <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 20 }} />
          <div className="skeleton skeleton-text" style={{ width: 60, height: 12 }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonInsights() {
  return (
    <div className="insights-strip">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="insight-chip" style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: '60%', height: 10 }} />
          <div className="skeleton skeleton-text" style={{ width: '80%', height: 18, marginBottom: 0 }} />
        </div>
      ))}
    </div>
  )
}
