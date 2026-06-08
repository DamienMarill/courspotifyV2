import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import type { PlaylistEntry } from '../../types'

interface PlaylistItemProps {
  entry: PlaylistEntry
  index: number
  total: number
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onRemove: (deezerId: number) => void
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

export function PlaylistItem({
  entry,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: PlaylistItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: entry.deezer_id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2"
    >
      <button
        type="button"
        className="cursor-grab rounded p-2 text-slate-500 hover:bg-slate-100"
        aria-label={`Déplacer ${entry.name}`}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <div className="h-14 w-14 rounded bg-slate-100" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{entry.name}</p>
        <p className="truncate text-xs text-slate-600">{entry.artist_name}</p>
      </div>
      <span className="text-xs text-slate-500">{formatDuration(entry.duration_ms)}</span>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          className="rounded border border-slate-300 px-2 text-xs disabled:opacity-50"
          disabled={index === 0}
          onClick={() => onMoveUp(index)}
          aria-label={`Monter ${entry.name}`}
        >
          ▲
        </button>
        <button
          type="button"
          className="rounded border border-slate-300 px-2 text-xs disabled:opacity-50"
          disabled={index === total - 1}
          onClick={() => onMoveDown(index)}
          aria-label={`Descendre ${entry.name}`}
        >
          ▼
        </button>
      </div>
      <button
        type="button"
        className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-600"
        onClick={() => onRemove(entry.deezer_id)}
      >
        🗑 Supprimer
      </button>
    </li>
  )
}
