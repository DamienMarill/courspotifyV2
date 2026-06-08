import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { PlaylistEntry } from '../../types'
import { PlaylistItem } from './PlaylistItem'

interface PlaylistPanelProps {
  entries: PlaylistEntry[]
  maxSize: number
  onRemove: (deezerId: number) => void
  onReorder: (oldIndex: number, newIndex: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

export function PlaylistPanel({
  entries,
  maxSize,
  onRemove,
  onReorder,
  onMoveUp,
  onMoveDown,
}: PlaylistPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = entries.findIndex((entry) => entry.deezer_id === active.id)
    const newIndex = entries.findIndex((entry) => entry.deezer_id === over.id)

    if (oldIndex >= 0 && newIndex >= 0) {
      onReorder(oldIndex, newIndex)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Playlist</h2>
      <p className="mb-3 text-sm text-slate-600">
        {entries.length} / {maxSize} tracks
      </p>

      {entries.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Votre playlist est vide
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={entries.map((entry) => entry.deezer_id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {entries.map((entry, index) => (
                <PlaylistItem
                  key={entry.deezer_id}
                  entry={entry}
                  index={index}
                  total={entries.length}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  )
}
