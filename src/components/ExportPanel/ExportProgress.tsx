interface ExportProgressProps {
  current: number
  total: number
  trackName: string
}

export function ExportProgress({ current, total, trackName }: ExportProgressProps) {
  const progressPercent = total === 0 ? 0 : Math.round((current / total) * 100)

  return (
    <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
      <p className="font-medium">{current} / {total} tracks enrichis</p>
      <p className="mt-1">Track en cours : {trackName}</p>
      <div className="mt-2 h-2 rounded bg-indigo-100">
        <div
          className="h-full rounded bg-indigo-600"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
